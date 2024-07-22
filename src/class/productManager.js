import fs from "node:fs";

class ProductManager {
  constructor(path) {
    this.path = path;
    this.productsList = [];
  }

  async setNewId() {
    try {
      await this.getAllProducts();
      return this.productsList.length + 1;
    } catch (error) {
      console.error("Error al obtener el nuevo ID", error);
    }
  }

  // Funciones para Productos:
  async getProduct(id) {
    try {
      await this.getAllProducts();
      const product = this.productsList.find((prod) => prod.id == id);
      if (product) {
        console.log("Producto encontrado");
        return product;
      } else {
        console.log("Producto no encontrado");
        return null;
      }
    } catch (error) {
      console.error("Error al leer el archivo", error);
      return null;
    }
  }

  async getAllProducts() {
    try {
      const list = await fs.promises.readFile(this.path, "utf-8");
      this.productsList = [...JSON.parse(list).products];
      return [...this.productsList];
    } catch (error) {
      console.error("Error al leer el archivo", error);
      return [];
    }
  }

  async addProduct(product) {
    try {
      // Asignamos el nuevo ID al producto
      product.id = await this.setNewId();
      await this.getAllProducts();
      this.productsList.push(product);

      await fs.promises.writeFile(
        this.path,
        JSON.stringify({ products: this.productsList })
      );

      console.log("Producto agregado");
      return product;
    } catch (error) {
      console.error("Error al agregar el producto:", error);
    }
  }

  async updateProduct(product, id) {
    try {
      await this.getAllProducts();
      const index = this.productsList.findIndex((prod) => prod.id == id);
      if (index !== -1) {
        this.productsList[index] = {
          ...this.productsList[index],
          ...product,
        };
        await fs.promises.writeFile(
          this.path,
          JSON.stringify({ products: this.productsList })
        );
        console.log("Producto actualizado:");
      } else {
        console.log("ID no encontrado");
      }
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
    }
  }

  async deleteProduct(id) {
    try {
      await this.getAllProducts();
      const index = this.productsList.findIndex((prod) => prod.id == id);
      if (index !== -1) {
        this.productsList.splice(index, 1);
        await fs.promises.writeFile(
          this.path,
          JSON.stringify({ products: this.productsList })
        );
        console.log("Producto Eliminado", id);
      } else {
        console.log("ID no encontrado");
      }
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
    }
  }
}

export default ProductManager;
