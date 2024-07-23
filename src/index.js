import express from "express";
import productsRoute from "./routes/products.router.js";
import cartsRoute from "./routes/carts.router.js";
import { __dirname } from "./utils.js";
import homeRoute from "./routes/home.router.js";
import realTimeProducts from "./routes/realTimeProducts.router.js";
import handlebars from "express-handlebars";
import { Server } from "socket.io";
import ProductManager from "./class/productManager.js";

const app = express();
const productManager = new ProductManager(__dirname + "/data/products.json");
const PORT = 8080;

//motor de plantillas y visualizaciones:
app.engine("handlebars", handlebars.engine());
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use("/api/products", productsRoute);
app.use("/api/carts", cartsRoute);
app.use("/home", homeRoute);
app.use("/real-time-products", realTimeProducts);

//escucha del server:
const httpServer = app.listen(PORT, () => {
  console.log("Servidor escuchando en el puerto 8080");
});

//socket
export const socketServer = new Server(httpServer);
socketServer.on("connection", async (socket) => {
  console.log("Nuevo cliente conectado. Id: " + socket.id);

  try {
    const productsList = await productManager.getAllProducts();
    socket.emit("home", productsList);
    socket.emit("realtime", productsList);
  } catch (error) {
    console.error("Error al obtener la lista de productos", error);
  }

  socket.on("nuevo-producto", async (producto) => {
    try {
      await productManager.addProduct(producto);
      //despues de agregar un producto, obtener la lista actualizada antes de emitirla a todos los clientes:
      const updatedProductsList = await productManager.getAllProducts();
      socketServer.emit("realtime", updatedProductsList);
    } catch (error) {
      console.error("Error al agregar el producto", error);
    }
  });

  socket.on("eliminar-producto", async (productId) => {
    try {
      await productManager.deleteProduct(productId);
      //despues de eliminar un producto, obtener la lista actualizada antes de emitirla a todos los clientes:
      const updatedProductsList = await productManager.getAllProducts();
      socketServer.emit("realtime", updatedProductsList);
    } catch (error) {
      console.error("Error al eliminar el producto", error);
    }
  });
});
