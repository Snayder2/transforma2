//Paquetes
require("dotenv-flow").config();

//Librerias
const https = require("https");
const http = require("http");
const fs = require("fs");
const socketIo = require("socket.io");

//Modulos
const app = require("./index");

class clsServer {
    #objServer;

    async main() {
        await this.#server();
        this.#socket();
    }

    async #server() {
        if (app.get("typeServer") === "production") {
            this.#objServer = https
                .createServer(
                    {
                        key: fs.readFileSync(
                            "/var/www/servicios.demismanos.org/ssl/servicios.demismanos.org-le.key"
                        ),
                        cert: fs.readFileSync(
                            "/var/www/servicios.demismanos.org/ssl/servicios.demismanos.org-le.crt"
                        ),
                    },
                    app
                )
                .listen(app.get("port"), () => {
                    console.log(
                        "HTTPS server listening on port " + app.get("port") + "..."
                    );
                });
        } else {
            this.#objServer = http.createServer(app).listen(app.get("port"));
        }
    }

    #socket() {
        let arrComentarios = [];

        const io = socketIo(this.#objServer, {
            cors: {
                origin:
                    app.get("typeServer") === "production"
                        ? "https://servicios.demismanos.org:8000"
                        : "http://localhost:3000",
                methods: ["GET", "POST", "DELETE", "PUT"],
            },
        });

        io.on("connection", (client) => {
            client.on("mdlComentarios:setComentario", (data) => {
                arrComentarios.push({
                    strTipo: data.strTipo,
                    srtMensaje: data.srtMensaje,
                    dtFechaCreacion: new Date(),
                    strUsuario: data.strUsuario,
                    strUsuarioAsignado: "",
                    strURLImagenUsuario: data.strURLImagenUsuario,
                });

                client.emit("mdlComentarios:setComentario", arrComentarios);
            });

            client.emit("mdlComentarios:getComentarios", arrComentarios);
        });
    }
}

module.exports = clsServer;
