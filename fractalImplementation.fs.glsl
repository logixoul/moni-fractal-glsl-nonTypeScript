		// set samples from 1-16 for quality selection
const int samples = 1;
// set iterations from 1000 for speed to 3000 for completeness
//const int iterations = 100;

struct Complex {
    float real;
    float imag;
};

// Function to raise a complex number (base) to a complex power (exponent)
Complex cpow(Complex base, Complex exponent) {
    // Extract real and imaginary parts of the base and exponent
    float a = base.real;
    float b = base.imag;
    float c = exponent.real;
    float d = exponent.imag;

    // Calculate modulus and argument (angle) of the base
    float modulus = sqrt(a * a + b * b);
    float arg = atan(b, a);

    // Calculate log modulus and real and imaginary parts of the exponent term
    float logModulus = log(modulus);
    float realPart = exp(c * logModulus - d * arg);
    float imaginaryPart = c * arg + d * logModulus;

    // Calculate final real and imaginary parts using Euler's formula
    Complex result;
    result.real = realPart * cos(imaginaryPart);
    result.imag = realPart * sin(imaginaryPart);

    return result;
}

/*Complex conjugate(Complex c) {
	return Complex(c.real, -c.imag);
}*/

Complex csin(Complex z) {
    float realPart = sin(z.real) * cosh(z.imag);
    float imagPart = cos(z.real) * sinh(z.imag);
    return Complex(realPart, imagPart);
}

Complex ccos(Complex z) {
    float realPart = cos(z.real) * cosh(z.imag);
    float imagPart = -sin(z.real) * sinh(z.imag);
    return Complex(realPart, imagPart);
}

Complex cexp(Complex z) {
    float expReal = exp(z.real) * cos(z.imag);
    float expImag = exp(z.real) * sin(z.imag);
    return Complex(expReal, expImag);
}

Complex clog(Complex z) {
    float magnitude = sqrt(z.real * z.real + z.imag * z.imag);
    float angle = atan(z.imag, z.real);
    return Complex(log(magnitude), angle);
}

Complex cdiv(Complex a, Complex b) {
    float modulusSquared = b.real * b.real + b.imag * b.imag;
    return Complex((a.real * b.real + a.imag * b.imag) / modulusSquared,
                   (a.imag * b.real - a.real * b.imag) / modulusSquared);
}

Complex cmul(Complex a, Complex b) {
    return Complex(a.real * b.real - a.imag * b.imag,
                   a.real * b.imag + a.imag * b.real);
}

Complex cSuperRoot(Complex z) {
    Complex w = Complex(1.0, 0.0); // Initial guess
    for (int i = 0; i < 10; i++) {
        Complex wLogW = cmul(w, clog(w)); // w * log(w)
        Complex numerator = clog(z);
        numerator = cdiv(numerator, clog(w));
        Complex denominator = Complex(1.0, 0.0);
        w = cdiv(w, numerator);
    }
    return w; // ?????????????
}

Complex cinverse(Complex z) {
    float modulusSquared = z.real * z.real + z.imag * z.imag;
    return Complex(z.real / modulusSquared, -z.imag / modulusSquared);
}

float moniFractal(vec2 coord) {
    // Тук имплементирам алгоритъма, който GPT беше имплементирал на Пайтън

    Complex z = Complex(coord.x, coord.y);
	//Complex r = Complex(initialX, initialY);
    Complex r = z;
    //Complex k = Complex(initialX, initialY);
	for (int i = 0; i < int(numIterations); i++){
        // superroot:
    	r = cpow(z, cinverse(r));

        // ugly:
        //r = cdiv(z, cexp(r));
        //r = clog(cdiv(z, r));

        //r = cpow(z, cinverse(cpow(r, r)));

        //r = cmul(r, r) + z;

		// Smooth escape time for richer gradients.
        float r2 = r.real * r.real + r.imag * r.imag;
        if (r2 > 4.0 || r2 < .00001) {
            float iter = float(i);
            float smooth_ = iter + 1.0 - log(log(sqrt(r2))) / log(2.0);
            return smooth_/100.0;
        }
	}
	return 0.0;
}
vec4 mapColor(float f) {
	//return vec4(vec3(mcol), 1.0);
	f = sqrt(f); // lx
	return vec4(0.5 + 0.5*cos(2.7+f*30.0 + vec3(0.0,.6,1.0)),1.0);
}
