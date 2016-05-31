// add unicode support to process spawning

function spawn_process_internal (program, args, blocking) {
    var process = Cc["@mozilla.org/process/util;1"]
        .createInstance(Ci.nsIProcess);
    process.init(find_file_in_path(program));
    return process.runw(!!blocking, args, args.length);
}


function spawn_process (program_name, args, working_dir,
                        fds, fd_wait_timeout) {

    let deferred = Promise.defer();

    var spawn_process_helper_program = find_spawn_helper();
    if (spawn_process_helper_program == null)
        throw new Error("Error spawning process: conkeror-spawn-helper not found");
    args = args.slice();
    if (args[0] == null)
        args[0] = (program_name instanceof Ci.nsIFile) ? program_name.path : program_name;

    program_name = find_file_in_path(program_name).path;

    const key_length = 100;
    const fd_spec_size = 15;

    if (fds == null)
        fds = {};

    if (fd_wait_timeout === undefined)
        fd_wait_timeout = spawn_process_helper_default_fd_wait_timeout;

    var unregistered_transports = [];
    var registered_transports = [];

    var server = null;
    var setup_timer = null;

    const CONTROL_CONNECTED = 0;
    const CONTROL_SENDING_KEY = 1;
    const CONTROL_SENT_KEY = 2;

    var control_state = CONTROL_CONNECTED;
    var terminate_pending = false;

    var control_transport = null;

    var control_binary_input_stream = null;
    var control_output_stream = null, control_input_stream = null;
    var exit_status = null;

    var client_key = "";
    var server_key = "";
    // Make sure key does not have any 0 bytes in it.
    for (let i = 0; i < key_length; ++i)
        client_key += String.fromCharCode(Math.floor(Math.random() * 255) + 1);

    // Make sure key does not have any 0 bytes in it.
    for (let i = 0; i < key_length; ++i)
        server_key += String.fromCharCode(Math.floor(Math.random() * 255) + 1);

    var key_file_fd_data = "";

    // This is the total number of redirected file descriptors.
    var total_client_fds = 0;

    // This is the total number of redirected file descriptors that will use a socket connection.
    var total_fds = 0;

    for (let i in fds) {
        if (fds.hasOwnProperty(i)) {
            if (fds[i] == null) {
                delete fds[i];
                continue;
            }
            key_file_fd_data += i + "\0";
            let fd = fds[i];
            if ('file' in fd) {
                if (fd.perms == null)
                    fd.perms = parseInt("0666", 8);
                key_file_fd_data += fd.file + "\0" + fd.mode + "\0" + fd.perms + "\0";
                delete fds[i]; // Remove it from fds, as we won't need to work with it anymore
            } else {
                ++total_fds;
                key_file_fd_data += "\0";
            }
            ++total_client_fds;
        }
    }
    var key_file_data = client_key + "\0" + server_key + "\0" + program_name + "\0" +
        (working_dir != null ? working_dir.path : "") + "\0" + args.length + "\0";

    var key_file_data2 = args.join("\0") + "\0";
    var key_file_data3 = total_client_fds + "\0" + key_file_fd_data;

    // var key_file_data = client_key + "\0" + server_key + "\0" + program_name + "\0" +
    //     (working_dir != null ? working_dir.path : "") + "\0" +
    //     args.length + "\0" +
    //     args.join("\0") + "\0" +
    //     total_client_fds + "\0" + key_file_fd_data;
    
    function fail (e) {
        if (!terminate_pending) {
            deferred.reject(e);
            terminate();
        }
    }

    function cleanup_server () {
        if (server) {
            server.close();
            server = null;
        }
        for (let i in unregistered_transports) {
            unregistered_transports[i].close(0);
            delete unregistered_transports[i];
        }
    }

    function cleanup_fd_sockets () {
        for (let i in registered_transports) {
            registered_transports[i].transport.close(0);
            delete registered_transports[i];
        }
    }

    function cleanup_control () {
        if (control_transport) {
            control_binary_input_stream.close();
            control_binary_input_stream = null;
            control_transport.close(0);
            control_transport = null;
            control_input_stream = null;
            control_output_stream = null;
        }
    }

    function control_send_terminate () {
        control_input_stream = null;
        control_binary_input_stream.close();
        control_binary_input_stream = null;
        async_binary_write(control_output_stream, "\0", function () {
            control_output_stream = null;
            control_transport.close(0);
            control_transport = null;
        });
    }

    function terminate () {
        if (terminate_pending)
            return exit_status;
        terminate_pending = true;
        if (setup_timer) {
            setup_timer.cancel();
            setup_timer = null;
        }
        cleanup_server();
        cleanup_fd_sockets();
        if (control_transport) {
            switch (control_state) {
            case CONTROL_SENT_KEY:
                control_send_terminate();
                break;
            case CONTROL_CONNECTED:
                cleanup_control();
                break;
                /**
                 * case CONTROL_SENDING_KEY: in this case once the key
                 * is sent, the terminate_pending flag will be noticed
                 * and control_send_terminate will be called, so nothing
                 * more needs to be done here.
                 */
            }
        }
        return exit_status;
    }

    function canceler (e) {
        if (!terminate_pending) {
            deferred.reject(e);
            terminate();
        }
    }

    function finished () {
        if (!terminate_pending) {
            deferred.resolve(exit_status);
            terminate();
        }
    }

    // Create server socket to listen for connections from the external helper program
    try {
        server = Cc['@mozilla.org/network/server-socket;1']
            .createInstance(Ci.nsIServerSocket);

        var key_file = get_temporary_file("conkeror-spawn-helper-key.dat");
        write_binary_file(key_file, key_file_data);
        write_text_file(key_file, key_file_data2, $mode = MODE_WRONLY | MODE_APPEND);
        write_binary_file(key_file, key_file_data3, $mode = MODE_WRONLY | MODE_APPEND);

        server.init(-1 /* choose a port automatically */,
                    true /* bind to localhost only */,
                    -1 /* select backlog size automatically */);

        setup_timer = call_after_timeout(function () {
            setup_timer = null;
            if (control_state != CONTROL_SENT_KEY)
                fail("setup timeout");
        }, spawn_process_helper_setup_timeout);

        var wait_for_fd_sockets = function wait_for_fd_sockets () {
            var remaining_streams = total_fds * 2;
            var timer = null;
            function handler () {
                if (remaining_streams != null) {
                    --remaining_streams;
                    if (remaining_streams == 0) {
                        if (timer)
                            timer.cancel();
                        finished();
                    }
                }
            }
            for each (let f in registered_transports) {
                input_stream_async_wait(f.input, handler, false /* wait for closure */);
                output_stream_async_wait(f.output, handler, false /* wait for closure */);
            }
            if (fd_wait_timeout != null) {
                timer = call_after_timeout(function() {
                    remaining_streams = null;
                    finished();
                }, fd_wait_timeout);
            }
        }

        var control_data = "";

        var handle_control_input = function handle_control_input () {
            if (terminate_pending)
                return;
            try {
                let avail = control_input_stream.available();
                if (avail > 0) {
                    control_data += control_binary_input_stream.readBytes(avail);
                    var off = control_data.indexOf("\0");
                    if (off >= 0) {
                        let message = control_data.substring(0,off);
                        exit_status = parseInt(message);
                        cleanup_control();
                        /* wait for all fd sockets to close? */
                        if (total_fds > 0)
                            wait_for_fd_sockets();
                        else
                            finished();
                        return;
                    }
                }
                input_stream_async_wait(control_input_stream, handle_control_input);
            } catch (e) {
                // Control socket closed: terminate
                cleanup_control();
                fail(e);
            }
        }

        var registered_fds = 0;

        server.asyncListen(
            {
                onSocketAccepted: function (server, transport) {
                    unregistered_transports.push(transport);
                    function remove_from_unregistered () {
                        var i;
                        i = unregistered_transports.indexOf(transport);
                        if (i >= 0) {
                            unregistered_transports.splice(i, 1);
                            return true;
                        }
                        return false;
                    }
                    function close () {
                        transport.close(0);
                        remove_from_unregistered();
                    }
                    var received_data = "";
                    var header_size = key_length + fd_spec_size;

                    var in_stream, bin_stream, out_stream;

                    function handle_input () {
                        if (terminate_pending)
                            return;
                        try {
                            let remaining = header_size - received_data.length;
                            let avail = in_stream.available();
                            if (avail > 0) {
                                if (avail > remaining)
                                    avail = remaining;
                                received_data += bin_stream.readBytes(avail);
                            }
                            if (received_data.length < header_size) {
                                input_stream_async_wait(in_stream, handle_input);
                                return;
                            } else {
                                if (received_data.substring(0, key_length) != client_key)
                                    throw "Invalid key";
                            }
                        } catch (e) {
                            close();
                        }
                        try {
                            var fdspec = received_data.substring(key_length);
                            if (fdspec.charCodeAt(0) == 0) {

                                // This is the control connection
                                if (control_transport)
                                    throw "Control transport already exists";
                                control_transport = transport;
                                control_output_stream = out_stream;
                                control_input_stream = in_stream;
                                control_binary_input_stream = bin_stream;
                                remove_from_unregistered();
                            } else {
                                var fd = parseInt(fdspec);
                                if (!fds.hasOwnProperty(fd) || (fd in registered_transports))
                                    throw "Invalid fd";
                                remove_from_unregistered();
                                bin_stream = null;
                                registered_transports[fd] = {transport: transport,
                                                             input: in_stream,
                                                             output: out_stream};
                                ++registered_fds;
                            }
                            if (control_transport && registered_fds == total_fds) {
                                cleanup_server();
                                control_state = CONTROL_SENDING_KEY;
                                async_binary_write(control_output_stream, server_key,
                                                   function (error) {
                                                       if (error != null)
                                                           fail(error);
                                                       control_state = CONTROL_SENT_KEY;
                                                       if (setup_timer) {
                                                           setup_timer.cancel();
                                                           setup_timer = null;
                                                       }
                                                       if (terminate_pending) {
                                                           control_send_terminate();
                                                       } else {
                                                           for (let i in fds) {
                                                               let f = fds[i];
                                                               let t = registered_transports[i];
                                                               if ('input' in f)
                                                                   f.input(t.input);
                                                               else
                                                                   t.input.close();
                                                               if ('output' in f)
                                                                   f.output(t.output);
                                                               else
                                                                   t.output.close();
                                                           }
                                                       }
                                                   });
                                input_stream_async_wait(control_input_stream, handle_control_input);
                            }
                        } catch (e) {
                            fail(e);
                        }
                    }

                    try {
                        in_stream = transport.openInputStream(Ci.nsITransport.OPEN_NON_BLOCKING, 0, 0);
                        out_stream = transport.openOutputStream(Ci.nsITransport.OPEN_NON_BLOCKING, 0, 0);
                        bin_stream = binary_input_stream(in_stream);
                        input_stream_async_wait(in_stream, handle_input);
                    } catch (e) {
                        close();
                    }
                },
                onStopListening: function (s, status) {
                }
            });

        spawn_process_internal(spawn_process_helper_program, [key_file.path, server.port], false);
        return make_cancelable(deferred.promise, canceler);
    } catch (e) {
        terminate();

        if ((e instanceof Ci.nsIException) && e.result == Cr.NS_ERROR_INVALID_POINTER) {
            if (WINDOWS)
                throw new Error("Error spawning process: not yet supported on MS Windows");
            else
                throw new Error("Error spawning process: conkeror-spawn-helper not found");
        }
        // Allow the exception to propagate to the caller
        throw e;
    }
}
