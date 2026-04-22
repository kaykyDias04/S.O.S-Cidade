// Arquivo: generate-hash.js
const bcrypt = require('bcryptjs');

const password = '123456';
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);

console.log('Senha Original:', password);
console.log('Hash Gerado:', hash);
console.log('\nCopie o hash gerado e cole no campo "password" do usuário desejado em seu arquivo fakeapi/data/db.json');
