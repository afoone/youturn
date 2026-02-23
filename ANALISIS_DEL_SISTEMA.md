# Estudio del Sistema: YourTurn Manager

## 1. Visión General del Sistema
**YourTurn Manager** es una plataforma moderna integral diseñada para la gestión inteligente de colas y turnos. Su principal objetivo es modernizar la atención al cliente en diversos tipos de negocios (clínicas, oficinas gubernamentales, restaurantes, etc.), reemplazando los sistemas manuales obsoletos y caros con una solución digital ágil, económica y en tiempo real.

## 2. Funcionalidades Principales Implementadas (Inventario del Código)
A través del análisis del Backend (`server/src/`) y Frontend (`frontend/src/app/`), se ha identificado que el sistema actualmente tiene las siguientes pantallas, modelos y lógicas implementadas:

### 2.1. Gestión de Identidad y Acceso
* **Autenticación (Auth):** Login de usuarios con JWT. Rutas y controladores de registro, inicio de sesión.
* **Gestión de Usuarios (Users):** ABM (Alta, Baja y Modificación) de usuarios del sistema con diferentes roles.
* **Gestión Multi-Empresa (Enterprises):** Creación y administración de las distintas empresas o sucursales físicas (tenants) que tienen entidades organizativas.

### 2.2. Gestión Comercial y Límites
* **Planes de Suscripción (Plans):** El sistema permite crear y gestionar "Planes" comerciales, los cuales dictaminan cuántas empresas, usuarios, servicios y puntos de atención (ticket points) puede tener un cliente registrado.

### 2.3. Estructura de Atención (Setup de la Empresa)
* **Puntos de Generación de Tickets (Ticket Points):** ABM de kioscos o zonas donde los usuarios pueden escanear QR's para recibir un número de atención.
* **Servicios de Atención (Services):** Los distintos departamentos o colas que una empresa maneja (ej. "Atención Médica", "Mesa de Ayuda", "Cobros"). Un servicio puede estar clasificado como prioritario (VIP).
* **Pantallas Públicas (Screens):** Configuración de las pantallas de TV o monitores que los clientes miran en sala de espera.
* **Operadores (Operators):** Registros de los módulos de atención (ej. Caja 1, Ventanilla 2) y su vinculación con usuarios específicos que atienden allí.

### 2.4. Flujo en Tiempo Real (Colas y Turnos)
* **Emisión de Tickets (Customers & Queue):** El cliente (Customer) se registra para un servicio desde la app cliente/kiosco y entra a la `ServiceQueue` (Cola de Espera).
* **Panel de Operador (Operador / Cajero):**
  * Pantalla frontal (página `operator`) y componentes del panel (navbar, listado, llamadas).
  * Lógica para "Llamar Siguiente", procesando la prioridad configurada.
  * Cambiar estados del ticket ("En espera", "Atendiendo", "Completado").
* **Dashboard/Pantalla Pública (Screen):** El frontend tiene una página (`pages/screen`) sin controles que consume vía polling o sockets los tickets llamándose en este momento y los próximos.
* **Generación PDF / Passkit:** El cliente puede potencialmente descargar un PDF exportado (`jspdf`) para tener su número o una passkit nativa en dispositivos iOS.

## 3. Arquitectura y Stack Tecnológico
La aplicación se divide en dos componentes principales y se sirve como contenedores independientes orquestados por Docker.

### 3.1. Frontend (Aplicación Web / Pantallas / Panel)
* **Framework Web:** Angular 19.
* **Aspecto Visual (UI):** PrimeNG (componentes) junto con PrimeIcons y desarrollo responsivo basado en CSS moderno.
* **Programación Reactiva:** Emplea de manera extensiva RxJS.
* **Componentes Auxiliares:** Uso de bibliotecas para lectura/generación (ej. *qrcode* para validación y entrega de tickets) y *jspdf* para exportaciones en el navegador.

### 3.2. Backend (API y Lógica Central)
* **Entorno y Lenguaje:** Node.js (Express.js framework) escrito en TypeScript.
* **Base de Datos:** Inicializado con **MongoDB** (la comunicación se da a través de *mongoose*).
* **Autenticación y Seguridad:** El sistema valida e intercambia identidad a través de JWT (*jsonwebtoken*) y maneja encripción/hashing a través de la librería *sha3* estándar.
* **Generación de Archivos y Passes:** Cuenta con *pdfkit* para fabricar archivos exportables y *passkit-generator*, que sugiere la funcionalidad de emitir pases digitales (para Apple Wallet / Google Wallet) para que los usuarios lleven su ticket digital guardado en el teléfono con notificaciones nativas push.

### 3.3. Infraestructura y Despliegue
* Despliegue empaquetado y automatizado utilizando **Docker** y **Docker Compose**.
* El clúster actualmente dispone de la red para un servicio de backend interno (`backend` expuesto en port 3000), uno de frontend interactivo (`frontend` expuesto en port 3001).
* *Nota adicional*: Existe una configuración en Docker Compose vinculando temporal o intencionalmente un servidor de base de datos alternativo `sqlserver` (MSSQL Server), quizás destinado a la integración con sistemas corporativos heredados o requerimientos de algún cliente "Enterprise".

## 4. Requerimientos

### 4.1. Requerimientos de Software (Entorno local y Despliegue)
* Node.js y el entorno de entorno de red apto; un gestor de paquetes (`npm`).
* Dependencias base del contenedor: **Docker** y **Docker Compose** ejecutándose para levantar la base de datos MongoDB (y opcionalmente SQL Server) o cargar el contenedor.

### 4.2. Requerimientos Funcionales Identificados
* **Baja latencia:** Las actualizaciones de estado (Ticket emitido, llamando a usuario, turno finalizado) deben reflejarse casi en tiempo real tanto en las Pantallas Públicas como en los dispositivos administrativos de los Operadores.
* **Generación y Autonomía de Tickets:** Los clientes deben poder generar y acoplarse y comprobar el estado de sus propios turnos mediante sus dispositivos a través de código QR, reduciendo personal de recepción.
* **Distintos perfiles:** Separación clara entre Administradores (Dashboard general de empresas y control global), Operadores (manejan la línea puntual) y Pantallas (modo read-only de sólo lectura interactiva).

### 4.3. Requerimientos No Funcionales Identificados en el Proyecto
* **Escalabilidad y Flexibilidad:** Diseño escalable preparado para Multi-tenant (Multi-empresa) capaz de limitar el uso según cuotas (Tickets, Usuarios y Servicios) según el plan de pago adquirido.
* **Seguridad:** Rutas de la API restringidas mediante JWT y permisos (RBAC). 
* **Uso Offline Limitado / Recuperación de Estado:** Se intuye que los paneles deben mantener estado del momento y colas concurrentemente.
* **Genería móvil (Responsive):** Diseño pensado fundamentalmente para smartphones, tablets de recepción y Web moderna.
