// ===============================
// FUNCIÓN DE AYUDA: CAPITALIZAR ORACIÓN
// ===============================
/**
 * Convierte solo la primera letra de la cadena a mayúscula.
 * El resto de la cadena se convierte a minúsculas.
 * Ej: "ejemplo de frase" -> "Ejemplo de frase"
 */
function capitalizarOracion(cadena) {
 if (!cadena) {
 return "";
 }
 const primeraLetra = cadena.charAt(0).toUpperCase();
 const restoDeLaCadena = cadena.slice(1).toLowerCase();
 return primeraLetra + restoDeLaCadena;
}

// ===============================
// FUNCIÓN DE AYUDA: PRECIO A NÚMERO
// ===============================
/**
 * Convierte una cadena de precio (ej: "$25000") a un entero.
 */
function precioANumero(precioStr) {
 if (!precioStr) return 0;
 // Remueve todos los caracteres que no sean dígitos
 const limpio = precioStr.toString().replace(/[^\d]/g, "");
 return parseInt(limpio, 10) || 0;
}

// Lista completa de productos (sin filtrar), accesible globalmente
let productosOriginales = [];

// ===============================
//  RENDER DEL CATÁLOGO
// ===============================
function renderProductos(lista) {
 const container = document.getElementById("productos-container");
 const estado = document.getElementById("estado-carga");

 container.innerHTML = "";

 if (!lista || lista.length === 0) {
 estado.textContent = "No hay productos registrados que coincidan con los filtros.";
 return;
 }

 estado.textContent = "";

 lista.forEach((prod) => {
 const card = document.createElement("article");
 card.className = "card-producto";

 // Imagen
 const img = document.createElement("img");
 img.src =
 prod.Imagen || "https://via.placeholder.com/300x200?text=Sin+imagen";
 img.alt = prod.Nombre;

 // Nombre capitalizado
 const nombreEl = document.createElement("h3");
 nombreEl.textContent = capitalizarOracion(prod.Nombre);

 // Descripción capitalizada
const descEl = document.createElement("p");
 descEl.className = "descripcion";
 descEl.textContent = capitalizarOracion(prod.Descripcion);

 const precioEl = document.createElement("p");
 precioEl.className = "precio";
 precioEl.textContent = prod.Precio ? "Precio: $" + prod.Precio : "";
 const categoriaEl = document.createElement("p");
 categoriaEl.className = "categoria";
 // Capitalizamos la categoría para mostrarla bien
 categoriaEl.textContent = prod.Categoria
 ? "Categoría: " + capitalizarOracion(prod.Categoria)
 : "";

 const btn = document.createElement("a");
 btn.className = "btn-whatsapp";
 btn.href = crearUrlWhatsapp(prod.Nombre);
 btn.target = "_blank";
 btn.innerHTML =
 '<span class="icon"></span> <span>Pedir por WhatsApp</span>';

 // Armando la tarjeta
 card.appendChild(img);
 card.appendChild(nombreEl);
 card.appendChild(descEl);
 card.appendChild(precioEl);
 card.appendChild(categoriaEl);
 card.appendChild(btn);

 container.appendChild(card);
 });
}

// ===============================
//  LÓGICA DE FILTROS
// ===============================
function llenarCategorias(productos) {
 const selectCategoria = document.getElementById("filtro-categoria");
if (!selectCategoria) return;

 // Reset, dejando solo "Todas"
 selectCategoria.innerHTML =
 '<option value="todas">Todas</option>';

 const categorias = new Set();
 productos.forEach((p) => {
 if (p.Categoria) {
 // Almacena la categoría en minúsculas para evitar duplicados por mayúsculas
 categorias.add(p.Categoria.toLowerCase());
 }
 });

 Array.from(categorias)
 .sort()
 .forEach((cat) => {
 const option = document.createElement("option");
 option.value = cat; // Valor en minúsculas para la lógica de filtrado
 option.textContent = capitalizarOracion(cat); // Texto con mayúscula para la vista
 selectCategoria.appendChild(option);
 });
}

function aplicarFiltros() {
 const selectCategoria = document.getElementById("filtro-categoria");
 const selectPrecio = document.getElementById("filtro-precio");

 const categoriaSeleccionada = selectCategoria
 ? selectCategoria.value
 : "todas";
 const rangoPrecio = selectPrecio ? selectPrecio.value : "todos";

 let filtrados = [...productosOriginales];

 // 1. Filtrar por categoría
 if (categoriaSeleccionada !== "todas") {
 filtrados = filtrados.filter(
 (p) =>
 (p.Categoria || "").toLowerCase() ===
 categoriaSeleccionada.toLowerCase()
);
 }

 // 2. Filtrar por precio
 filtrados = filtrados.filter((p) => {
const precioNum = precioANumero(p.Precio);

 if (rangoPrecio === "bajo") {
 return precioNum > 0 && precioNum < 20000;
}
 if (rangoPrecio === "medio") {
 return precioNum >= 20000 && precioNum <= 40000;
 }
 if (rangoPrecio === "alto") {
 return precioNum > 40000;
 }
 return true; // "todos"
 });

 renderProductos(filtrados);
}

// ===============================
//  CONFIG DE AIRTABLE Y WHATSAPP
// ===============================
// ⚠️ IMPORTANTE: Cambia esto por tu API KEY personal de Airtable:
const AIRTABLE_API_KEY =
 "patN0lotdwRdtnvpV.6cb8142777ff5ced84c0ecc6a6098ce01f06a1c14f58257a1a800091abde70dc";
const AIRTABLE_BASE_ID = "appgnUcGuQXlE7snj";
const AIRTABLE_TABLE = "Productos";
const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(
 AIRTABLE_TABLE
)}`;
const WHATSAPP_NUMBER = "573203167763";

function crearUrlWhatsapp(nombreProducto) {
 const mensaje = `Hola, me interesa el producto: ${nombreProducto}. ¿Está disponible?`;
 return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
 mensaje
 )}`;
}

// ===============================
//  CARGAR PRODUCTOS DESDE AIRTABLE
// ===============================
async function cargarProductos() {
 const estado = document.getElementById("estado-carga");

 try {
 estado.textContent = "Cargando productos...";

 const res = await fetch(AIRTABLE_URL, {
 headers: {
 // Nota: La sintaxis correcta es `Bearer ${token}` sin comas ni otros caracteres extra
 Authorization: `Bearer ${AIRTABLE_API_KEY}`, 
 },
 });

 if (!res.ok) throw new Error("Error al consultar Airtable");

 const json = await res.json();
 console.log("Datos desde Airtable:", json);

 const productos = json.records.map((prod) => ({
 Nombre: prod.fields["Nombre del Producto"] || "",
 Precio: prod.fields["Precio"] || "",
 Categoria: prod.fields["Categoría"] || "",
 Descripcion: prod.fields["Descripción"] || "",
 Imagen: prod.fields["Foto del Producto"]
 ? prod.fields["Foto del Producto"][0].url
 : "",
 }));

 // 1. Guardamos la lista original para filtrados
 productosOriginales = productos;

 // 2. Llenamos Select de categorías
llenarCategorias(productosOriginales);
 
 // 3. Renderizamos la vista inicial (aplica filtros por defecto "todas" y "todos")
 aplicarFiltros();
 } catch (err) {
 console.error("ERROR:", err);
 estado.textContent = "Ocurrió un error al cargar los productos. Revisa tu clave de Airtable.";
 }
}

// ===============================
//  INICIO DE EVENT LISTENERS
// ===============================
document.addEventListener("DOMContentLoaded", () => {
 cargarProductos();

 const selectCategoria = document.getElementById("filtro-categoria");
 const selectPrecio = document.getElementById("filtro-precio");

 // Asigna el evento de cambio a los selectores para aplicar filtros
 if (selectCategoria) {
 selectCategoria.addEventListener("change", aplicarFiltros);
 }
 if (selectPrecio) {
 selectPrecio.addEventListener("change", aplicarFiltros);
 }

});
