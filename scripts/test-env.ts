const testVar = process.env.TEST_VAR;
const mongoUri = process.env.MONGODB_URI;

console.log('--- ENV CHECK ---');
console.log(`TEST_VAR: ${testVar}`);
console.log(`MONGODB_URI: ${mongoUri ? 'Defined' : 'Undefined'}`);

if (testVar === 'hello_world') {
    console.log('✅ Environment variables are loading correctly.');
} else {
    console.error('❌ TEST_VAR failed to load.');
}
