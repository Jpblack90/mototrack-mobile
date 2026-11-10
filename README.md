# MotoTrack Mobile — App Android para Mecánicos y Almaceneros

Aplicación móvil complementaria para el personal operativo del taller (roles **mecánico** y **almacenero**), desarrollada con **React Native**, **Expo SDK 58** y **Expo Router**.

---

## 1. Requisitos Previos

- **Node.js**: v24.15.0 o superior.
- **Dispositivo Móvil**: Teléfono Android con la aplicación **Expo Go** instalada (versión de cliente compatible con Expo SDK 58, ej. 58.0.5).
- **Red Local**: La computadora donde se ejecuta el backend y el celular deben estar conectados a la **misma red Wi-Fi o router**.

---

## 2. Configuración de Red y Variables de Entorno

La aplicación consume la API REST del backend de MotoTrack AI mediante la variable de entorno `EXPO_PUBLIC_API_URL`.

### Paso 1: Identificar la IP local de tu PC
Abre PowerShell o CMD en Windows y ejecuta:
```bash
ipconfig
```
Localiza la dirección IPv4 de tu adaptador de red principal (Ethernet o Wi-Fi), por ejemplo: `192.168.101.11`.

### Paso 2: Configurar `.env`
Crea o edita el archivo `.env` en la raíz de `mototrack-mobile/`:
```env
EXPO_PUBLIC_API_URL=http://192.168.101.11:4000/api
```
*(Reemplaza `192.168.101.11` por la IP actual de tu computadora si difiere).*

> [!IMPORTANT]
> **Cambio de IP por el Router**: Si el router asigna una nueva IP dinámica a tu computadora por DHCP, debes actualizar `EXPO_PUBLIC_API_URL` en `.env` y reiniciar el servidor de desarrollo limpiando la caché con:
> ```bash
> npx expo start -c
> ```

---

## 3. Configuración del Firewall de Windows

Para permitir que el celular se comunique con el backend en el puerto **4000** y con el servidor de desarrollo de Expo en el puerto **8081**:

1. Abre **PowerShell como Administrador**.
2. Ejecuta las siguientes reglas de firewall (perfil Privado):
```powershell
New-NetFirewallRule -DisplayName "MotoTrack Backend 4000" -Direction Inbound -LocalPort 4000 -Protocol TCP -Action Allow -Profile Private
New-NetFirewallRule -DisplayName "Expo Metro 8081" -Direction Inbound -LocalPort 8081 -Protocol TCP -Action Allow -Profile Private
```

---

## 4. Instalación y Puesta en Marcha

1. **Instalar dependencias:**
   ```bash
   cd mototrack-mobile
   npm install
   ```

2. **Iniciar el servidor de desarrollo:**
   ```bash
   npx expo start
   ```

3. **Abrir en tu teléfono:**
   - Abre la app **Expo Go** en tu dispositivo Android.
   - Selecciona **Scan QR code** y escanea el código QR mostrado en la terminal de la computadora.
   - La aplicación se descargará y ejecutará en tiempo real en tu teléfono.

---

## 5. Cuentas de Acceso (Usuarios de Prueba)

Para probar la aplicación con datos presembrados de empresas `[PRUEBA]`:

| Rol | Correo | Contraseña | Comportamiento en la App |
| :--- | :--- | :--- | :--- |
| **Mecánico** | `pruebameca@mototrack.local` | `Demo1234!` | Acceso a tabs "Mis órdenes" y "Perfil" |
| **Almacenero** | `pruebaalmacen@mototrack.local` | `Demo1234!` | Acceso a tabs "Inventario" y "Perfil" |
| **Cajero** | `pruebacajero@mototrack.local` | `Demo1234!` | Pantalla de bloqueo: *"Esta app es para mecánicos y almaceneros. Usa la versión web."* |

---

## 6. Verificación de Calidad

Para ejecutar las comprobaciones de linting de Expo:
```bash
npx expo lint
```
