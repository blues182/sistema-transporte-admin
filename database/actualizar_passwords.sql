USE transportes_db;

UPDATE usuarios SET password = '$2a$10$Vs7ThsEg8JO3k1EMw4NyO.HItubC0byTbz1D3PkGkjFvO7XpYeAA.' WHERE username = 'admin';
UPDATE usuarios SET password = '$2a$10$tpF6jg9z2c1Wm1dskfTIEOEy/nWBMR5T1zCSi1gLuu8XXoGcjY4hW' WHERE username = 'usuario';

SELECT username, nombre, rol FROM usuarios;
