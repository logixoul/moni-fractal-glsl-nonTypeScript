		// set samples from 1-16 for quality selection
const int samples = 8;
// set iterations from 1000 for speed to 3000 for completeness
//const int iterations = 100;

vec2 complexMult(vec2 a, vec2 b) {
	return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x);
}

struct Complex {
    float real;
    float imag;
};

// Function to raise a complex number (base) to a complex power (exponent)
vec2 complexPow(vec2 base, vec2 exponent) {
    // Extract real and imaginary parts of the base and exponent
    float a = base.x;
    float b = base.y;
    float c = exponent.x;
    float d = exponent.y;

    // Calculate modulus and argument (angle) of the base
    float modulus = sqrt(a * a + b * b);
    float arg = atan(b, a);

    // Calculate log modulus and real and imaginary parts of the exponent term
    float logModulus = log(modulus);
    float realPart = exp(c * logModulus - d * arg);
    float imaginaryPart = c * arg + d * logModulus;

    // Calculate final real and imaginary parts using Euler's formula
    vec2 result;
    result.x = realPart * cos(imaginaryPart);
    result.y = realPart * sin(imaginaryPart);

    return result;
}

/*Complex conjugate(Complex c) {
	return Complex(c.real, -c.imag);
}*/

vec2 complexSin(vec2 z) {
    float realPart = sin(z.x) * cosh(z.y);
    float imagPart = cos(z.x) * sinh(z.y);
    return vec2(realPart, imagPart);
}

vec2 complexCos(vec2 z) {
    float realPart = cos(z.x) * cosh(z.y);
    float imagPart = -sin(z.x) * sinh(z.y);
    return vec2(realPart, imagPart);
}

vec2 complexExp(vec2 z) {
    float expReal = exp(z.x) * cos(z.y);
    float expImag = exp(z.x) * sin(z.y);
    return vec2(expReal, expImag);
}

vec2 complexLog(vec2 z) {
    float magnitude = length(z);
    float angle = atan(z.y, z.x);
    return vec2(log(magnitude), angle);
}

vec2 complexDiv(vec2 a, vec2 b) {
    float modulusSquared = b.x * b.x + b.y * b.y;
    return vec2((a.x * b.x + a.y * b.y) / modulusSquared,
                (a.y * b.x - a.x * b.y) / modulusSquared);
}

vec2 complexMul(vec2 a, vec2 b) {
    return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

vec2 complexSuperRoot(vec2 z) {
    vec2 w = vec2(1.0, 0.0); // Initial guess
    for (int i = 0; i < 10; i++) {
        vec2 wLogW = complexMul(w, complexLog(w)); // w * log(w)
        vec2 numerator = complexLog(z);
        numerator = complexDiv(numerator, complexLog(w));
        vec2 denominator = vec2(1.0, 0.0);
        w = complexDiv(w, numerator);
    }
    return w; // ?????????????
}

vec2 complexInverse(vec2 z) {
    float modulusSquared = z.x * z.x + z.y * z.y;
    return vec2(z.x / modulusSquared, -z.y / modulusSquared);
}

float moniFractal(vec2 coord) {
    // Тук имплементирам алгоритъма, който GPT беше имплементирал на Пайтън

    vec2 z = coord;
	vec2 result = z;
	for (int i = 0; i < int(numIterations); i++){
    	result = complexPow(z, complexInverse(result));
		if(result.x == 0.0 || result.y == 0.0)
			return float(i)/float(100);
	}
	return 0.0;
}
vec4 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d )
{
	return vec4(a + b*cos( 6.283185*(c*t+d) ), 1.0);
}
vec4 mapColor(float f) {
	//return vec4(vec3(mcol), 1.0);
	f = sqrt(f); // lx
	return vec4(0.5 + 0.5*cos(2.7+f*30.0 + vec3(0.0,.6,1.0)),1.0);
}
