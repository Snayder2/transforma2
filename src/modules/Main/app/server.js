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
                        ? "https://pruebas.demismanos.org"
                        : "http://localhost:3000",
                methods: ["GET", "POST", "DELETE", "PUT"],
            },
        });

        io.on("connection", (client) => {
            const clsSetComentario = require("../../Comentarios/domain/setComentario.service");
            const serviceGetComentarios = require("../../Comentarios/domain/getComentario.service");

            client.on("mdlComentarios:setComentario", async (data) => {
                let serviceSetComentario = new clsSetComentario(data);

                let response = await serviceSetComentario.main();

                if (response.data) {
                    let response = await serviceGetComentarios({
                        intIdEmpresario: data.intIdEmpresario,
                    });

                    client.emit("mdlComentarios:setComentario", response);
                }
            });

            client.on("mdlComentarios:getComentarios", async (data) => {
                let response = await serviceGetComentarios({
                    intIdEmpresario: data.intIdEmpresario,
                });

                client.emit("mdlComentarios:getComentarios", response);
            });
        });
    }
}

module.exports = clsServer;
