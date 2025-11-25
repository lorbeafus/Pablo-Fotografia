# Guía de Configuración de Firebase

Esta guía te ayudará a configurar Firebase para que el panel de administración funcione correctamente.

## Paso 1: Habilitar Authentication

1. Ve a la [Consola de Firebase](https://console.firebase.google.com)
2. Selecciona tu proyecto **pablo-fotografia**
3. En el menú lateral, haz clic en **Authentication** (Autenticación)
4. Haz clic en **Get Started** (Comenzar)
5. En la pestaña **Sign-in method** (Método de inicio de sesión):
   - Haz clic en **Email/Password**
   - Activa el interruptor **Enable** (Habilitar)
   - Haz clic en **Save** (Guardar)

### Crear Usuario Administrador

1. Ve a la pestaña **Users** (Usuarios)
2. Haz clic en **Add user** (Agregar usuario)
3. Ingresa:
   - **Email**: tu correo electrónico (ejemplo: admin@pablofotografia.com)
   - **Password**: una contraseña segura
4. Haz clic en **Add user** (Agregar usuario)

> **Importante**: Guarda estas credenciales, las necesitarás para iniciar sesión en el panel de administración.

---

## Paso 2: Habilitar Cloud Firestore

1. En el menú lateral, haz clic en **Firestore Database**
2. Haz clic en **Create database** (Crear base de datos)
3. Selecciona **Start in production mode** (Iniciar en modo de producción)
4. Haz clic en **Next** (Siguiente)
5. Selecciona la ubicación más cercana (ejemplo: **southamerica-east1** para Argentina)
6. Haz clic en **Enable** (Habilitar)

### Configurar Reglas de Seguridad de Firestore

1. Ve a la pestaña **Rules** (Reglas)
2. Reemplaza las reglas con el siguiente código:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Solo usuarios autenticados pueden leer y escribir
    match /images/{imageId} {
      allow read: if true; // Permitir lectura pública para mostrar en el sitio
      allow write: if request.auth != null; // Solo usuarios autenticados pueden escribir
    }
  }
}
```

3. Haz clic en **Publish** (Publicar)

---

## Paso 3: Habilitar Cloud Storage

1. En el menú lateral, haz clic en **Storage**
2. Haz clic en **Get started** (Comenzar)
3. Haz clic en **Next** (Siguiente) en el mensaje de reglas de seguridad
4. Selecciona la misma ubicación que usaste para Firestore
5. Haz clic en **Done** (Listo)

### Configurar Reglas de Seguridad de Storage

1. Ve a la pestaña **Rules** (Reglas)
2. Reemplaza las reglas con el siguiente código:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Permitir lectura pública para todas las imágenes
    match /{allPaths=**} {
      allow read: if true;
    }

    // Solo usuarios autenticados pueden subir/eliminar en las categorías
    match /{category}/{imageId} {
      allow write: if request.auth != null
                   && (category == 'bodas'
                   || category == '15años'
                   || category == 'vistas'
                   || category == 'books');
    }
  }
}
```

3. Haz clic en **Publish** (Publicar)

---

## Paso 4: Verificar la Configuración

### Estructura de Carpetas en Storage

Después de subir fotos, tu Storage debería tener esta estructura:

```
📁 pablo-fotografia.firebasestorage.app
  ├── 📁 bodas
  │   ├── 🖼️ 1732564123456_foto1.jpg
  │   └── 🖼️ 1732564234567_foto2.jpg
  ├── 📁 15años
  │   └── 🖼️ 1732564345678_foto3.jpg
  ├── 📁 vistas
  │   └── 🖼️ 1732564456789_foto4.jpg
  └── 📁 books
      └── 🖼️ 1732564567890_foto5.jpg
```

### Colección en Firestore

La colección `images` almacenará metadatos de cada imagen:

```javascript
{
  category: "bodas",
  url: "https://firebasestorage.googleapis.com/...",
  fileName: "1732564123456_foto1.jpg",
  uploadedAt: Timestamp,
  uploadedBy: "admin@pablofotografia.com"
}
```

---

## Paso 5: Acceder al Panel de Administración

1. Abre el archivo `admin.html` en tu navegador
2. Ingresa las credenciales que creaste en el Paso 1
3. ¡Listo! Ya puedes subir fotos

---

## Solución de Problemas

### Error: "Firebase: Error (auth/invalid-credential)"

- Verifica que el email y contraseña sean correctos
- Asegúrate de haber habilitado Email/Password en Authentication

### Error: "Missing or insufficient permissions"

- Verifica que las reglas de Firestore y Storage estén configuradas correctamente
- Asegúrate de estar autenticado

### Las imágenes no se muestran en la galería

- Verifica que Firestore esté habilitado
- Revisa la consola del navegador (F12) para ver errores
- Asegúrate de que las reglas de lectura permitan acceso público

### Error de CORS al subir imágenes

- Esto es normal en desarrollo local
- Las imágenes se subirán correctamente de todos modos
- En producción (con dominio), este error no aparecerá

---

## Próximos Pasos

Una vez configurado Firebase, puedes:

1. **Integrar las imágenes en tu sitio web**: Consultar Firestore desde las páginas de tu sitio para mostrar las fotos dinámicamente
2. **Agregar más administradores**: Crear más usuarios en Authentication
3. **Personalizar categorías**: Modificar las categorías en `admin.js` si es necesario
4. **Optimizar imágenes**: Considerar usar Firebase Extensions para redimensionar imágenes automáticamente

---

## Recursos Útiles

- [Documentación de Firebase Authentication](https://firebase.google.com/docs/auth)
- [Documentación de Cloud Firestore](https://firebase.google.com/docs/firestore)
- [Documentación de Cloud Storage](https://firebase.google.com/docs/storage)
