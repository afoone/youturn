// Script para crear usuario de aplicación en MongoDB
// Este script se ejecuta automáticamente cuando MongoDB se inicia por primera vez
// Según la documentación: https://hub.docker.com/_/mongo
// Los scripts .js se ejecutan usando mongosh con la base de datos especificada por MONGO_INITDB_DATABASE

// Autenticarse como root (creado automáticamente por MONGO_INITDB_ROOT_USERNAME/PASSWORD)
// Nota: En versiones recientes de MongoDB, los scripts pueden necesitar autenticarse
try {
  db.getSiblingDB('admin').auth('root', '07QLeXU25bgfrmRiqBrh');
} catch (e) {
  // Si la autenticación falla, continuar (puede que no sea necesaria en algunas versiones)
  print('Note: Root auth attempt: ' + e);
}

// Cambiar a la base de datos yourturn (especificada en MONGO_INITDB_DATABASE)
db = db.getSiblingDB('yourturn');

// Crear usuario de aplicación con permisos readWrite
try {
  db.createUser({
    user: 'app',
    pwd: '07QLeXU25bgfrmRiqBrh',
    roles: [
      {
        role: 'readWrite',
        db: 'yourturn'
      }
    ]
  });
  print('✓ User app created successfully in database yourturn');
} catch (error) {
  // Si el usuario ya existe, no hacer nada
  if (error.code === 51003 || error.codeName === 'DuplicateKey') {
    print('ℹ User app already exists');
  } else {
    print('✗ Error creating user: ' + error);
    print('Error details: ' + JSON.stringify(error));
  }
}

