# MotoTrack Mobile — App Android para Mecánicos y Almaceneros

Aplicación móvil complementaria para el personal operativo del taller (roles **mecánico** y **almacenero**), desarrollada con **React Native**, **Expo SDK 58** y **Expo Router**.

---

## 1. Requisitos Previos

- **Node.js**: v24.15.0 o superior.
- **Dispositivo Móvil**: Teléfono Android con la aplicación **Expo Go** instalada (versión de cliente compatible con Expo SDK 58, ej. 58.0.5) o el APK compilado con EAS.
- **Red Local**: La computadora donde se ejecuta el backend y el celular deben estar conectados a la **misma red Wi-Fi o router**.

---

## 2. Configuración de Red y Variables de Entorno

La aplicación consume la API REST del backend de MotoTrack AI mediante la variable de entorno `EXPO_PUBLIC_API_URL` o mediante la configuración dinámica desde la app.

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
> **Cambio de IP por el Router**: Si el router asigna una nueva IP dinámica a tu computadora por DHCP, puedes cambiarla directamente desde la app en el botón de engranaje del login sin recompilar, o actualizar `EXPO_PUBLIC_API_URL` en `.env` y reiniciar el servidor con:
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

## 4. Instalación y Puesta en Marcha (Desarrollo con Expo Go)

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
| **Almacenero** | `pruebaalmacen@mototrack.local` | `Demo1234!` | Acceso a tabs "Inventario", "Alertas" y "Perfil" |
| **Cajero** | `pruebacajero@mototrack.local` | `Demo1234!` | Pantalla de bloqueo: *"Esta app es para mecánicos y almaceneros. Usa la versión web."* |

---

## 6. Generar APK (EAS Build)

Para compilar el archivo ejecutable `.apk` e instalarlo directamente en cualquier dispositivo Android:

1. **Instalar la herramienta oficial de EAS:**
   ```bash
   npm i -g eas-cli
   ```

2. **Iniciar sesión con tu cuenta de Expo:**
   ```bash
   eas login
   ```

3. **Generar la compilación APK con el perfil preview:**
   ```bash
   eas build -p android --profile preview
   ```

Al finalizar la compilación en la nube de Expo, la terminal mostrará la URL y el código QR de descarga del archivo `.apk` listo para instalar.

> [!NOTE]
> La propiedad `android.usesCleartextTraffic: true` configurada en `expo-build-properties` es solo para la demo en red local por HTTP. En producción el backend va con HTTPS y esto se quita.

---

## 7. Cambiar de Red el Día de la Presentación

Si conectas la computadora y el celular a una red Wi-Fi distinta (por ejemplo, el Wi-Fi de la universidad o un punto de acceso móvil compartido desde tu celular), **no necesitas recompilar el APK ni reinstalar la app**:

1. Ejecuta `ipconfig` en la computadora para ver la nueva dirección IPv4 local (ej. `192.168.1.50`).
2. Abre **MotoTrack** en tu teléfono Android.
3. En la pantalla de **Iniciar Sesión**, toca el **ícono de engranaje** (⚙️) en la esquina superior derecha.
4. Escribe la nueva URL del backend (ej. `http://192.168.1.50:4000/api`).
5. Presiona **Probar conexión**.
6. Una vez que aparezca el mensaje **"Conectado"** en color verde, presiona **Guardar**.
7. Inicia sesión con tus credenciales normalmente.

*(Nota: si cambias el servidor desde la pestaña Perfil con una sesión activa, la app cerrará la sesión de forma segura para garantizar la autenticidad del token con el nuevo servidor).*

---

## 8. Verificación de Calidad

Para ejecutar las comprobaciones de linting de Expo:
```bash
npx expo lint
```
