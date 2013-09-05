//set the proxy server for this session only
proxy_server_default = "127.0.0.1";
proxy_port_default = 8123;

function set_proxy_session (window, server, port) {

    if (server == "N") {
        session_pref('network.proxy.type', 0); //direct connection
        window.minibuffer.message("Direction connection to the internet enabled for this session");
    } else {
        if (server == "") server = proxy_server_default;
        else proxy_server_default = server;

        if (port == "") port = proxy_port_default;
        else {
            port = parseInt(port);
            proxy_port_default = port;
        }

        session_pref('network.proxy.ftp',    server);
        session_pref('network.proxy.gopher', server);
        session_pref('network.proxy.http',   server);
        session_pref('network.proxy.socks',  server);
        session_pref('network.proxy.ssl',    server);

        session_pref('network.proxy.ftp_port',    port);
        session_pref('network.proxy.gopher_port', port);
        session_pref('network.proxy.http_port',   port);
        session_pref('network.proxy.socks_port',  port);
        session_pref('network.proxy.ssl_port',    port);

        session_pref('network.proxy.share_proxy_settings', 'true');
        session_pref('network.proxy.type', 1);

        window.minibuffer.message("All protocols using "+server+":"+port+" for this session");
    }
}

interactive("set-proxy-session", "set the proxy server for all protocols for this session only",
            function (I) {
                set_proxy_session(
                    I.window,
                    (yield I.minibuffer.read($prompt = "server ["+proxy_server_default+"] or N: ")),
                    (yield I.minibuffer.read($prompt = "port ["+proxy_port_default+"]: ")));
            });
