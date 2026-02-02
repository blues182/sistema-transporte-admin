const bcrypt = require('bcryptjs');

async function generarPasswords() {
  const admin = await bcrypt.hash('admin123', 10);
  const usuario = await bcrypt.hash('user123', 10);
  
  console.log('\n=== CONTRASEÑAS HASHEADAS ===\n');
  console.log('admin123:', admin);
  console.log('user123:', usuario);
  console.log('\n=== SQL PARA ACTUALIZAR ===\n');
  console.log(`UPDATE usuarios SET password = '${admin}' WHERE username = 'admin';`);
  console.log(`UPDATE usuarios SET password = '${usuario}' WHERE username = 'usuario';`);
}

generarPasswords();
