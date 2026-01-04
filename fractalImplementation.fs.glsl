		// set samples from 1-16 for quality selection
const int samples = 1;
// set iterations from 1000 for speed to 3000 for completeness
//const int iterations = 100;

vec2 cMult(vec2 a, vec2 b) {
	return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x);
}

struct Complex {
    float real;
    float imag;
};

// Function to raise a c number (base) to a c power (exponent)
vec2 cPow(vec2 base, vec2 exponent) {
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

vec2 cSin(vec2 z) {
    float realPart = sin(z.x) * cosh(z.y);
    float imagPart = cos(z.x) * sinh(z.y);
    return vec2(realPart, imagPart);
}

vec2 cCos(vec2 z) {
    float realPart = cos(z.x) * cosh(z.y);
    float imagPart = -sin(z.x) * sinh(z.y);
    return vec2(realPart, imagPart);
}

vec2 cExp(vec2 z) {
    float expReal = exp(z.x) * cos(z.y);
    float expImag = exp(z.x) * sin(z.y);
    return vec2(expReal, expImag);
}

vec2 cLog(vec2 z) {
    float magnitude = length(z);
    float angle = atan(z.y, z.x);
    return vec2(log(magnitude), angle);
}

vec2 cDiv(vec2 a, vec2 b) {
    float modulusSquared = b.x * b.x + b.y * b.y;
    return vec2((a.x * b.x + a.y * b.y) / modulusSquared,
                (a.y * b.x - a.x * b.y) / modulusSquared);
}

vec2 cMul(vec2 a, vec2 b) {
    return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

vec2 cSuperRoot(vec2 z) {
    vec2 w = vec2(1.0, 0.0); // Initial guess
    for (int i = 0; i < 10; i++) {
        vec2 wLogW = cMul(w, cLog(w)); // w * log(w)
        vec2 numerator = cLog(z);
        numerator = cDiv(numerator, cLog(w));
        vec2 denominator = vec2(1.0, 0.0);
        w = cDiv(w, numerator);
    }
    return w; // ?????????????
}

vec2 cInverse(vec2 z) {
    float modulusSquared = z.x * z.x + z.y * z.y;
    return vec2(z.x / modulusSquared, -z.y / modulusSquared);
}

float moniFractal(vec2 coord) {
    // Тук имплементирам алгоритъма, който GPT беше имплементирал на Пайтън

    vec2 z = coord;
	//vec2 r = vec2(initialX, initialY);
    vec2 r = vec2(0.0, 0.0);
    //vec2 k = vec2(initialX, initialY);
	for (int i = 0; i < int(numIterations); i++){
        // superroot:
    	//r = cPow(z, cInverse(r));

        // ugly:
        //r = cDiv(z, cExp(r));
        //r = cLog(cDiv(z, r));

        //r = cPow(z, cInverse(cPow(r, r)));

        r = cMul(r, r) + z;

		// Smooth escape time for richer gradients.
        float r2 = dot(r, r);
        if (r2 > 4.0 || r2 == 0.0) {
            float iter = float(i);
            float smooth_ = iter + 1.0 - log(log(sqrt(r2))) / log(2.0);
            return smooth_/numIterations;
        }
	}
	return 0.0;
}
vec4 mapColor(float f) {
	//return vec4(vec3(mcol), 1.0);
	//f = sqrt(f); // lx
    //f = log(f);
    //f *= 10.0;
	return vec4(0.5 + 0.5*cos(2.7+f*30.0 + vec3(0.0,.6,1.0)),1.0);
}
