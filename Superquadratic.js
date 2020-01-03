var canvas;
var gl;

var camera;

var numTimesToSubdivide = 0;
 
var index = 0;

var near = -20;
var far = 20;
var radius = 1.5;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

var left = -3.0;
var right = 3.0;
var ytop =3.0;
var bottom = -3.0;

//perspective look
var  fovy = 90.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect;       // Viewport aspect ratio

var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.5, 1);
var vc = vec4(-0.816497, -0.471405, 0.5, 1);
var vd = vec4(0.816497, -0.471405, 0.5,1);
    
var lightPosition = vec4(5.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 40.0;

var ctm;
var ambientColor, diffuseColor, specularColor;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var normalMatrix, normalMatrixLoc;

var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 3.0, 0.0);

//For super quadric shape
var e1 = 0.5;
var e2 = 0.5;
var N = 200;
var W = 40;

//necessary arrays
var pointsArray = [];
var normalsArray = [];
var colorsArray = [];
var texCoordsArray = [];
var textureDistanceArrayX = [];
var textureDistanceArrayY = [];
var textureRatioArrayX = [];
var textureRatioArrayY = [];

var pointsToBuffer = [];
var normalsToBuffer = [];

for(var i = 0; i <= W; i++){
	textureDistanceArrayY[i] = 0;
}
for(var i = 0; i <= N; i++){
	textureDistanceArrayX[i] = 0;
}

for(var i = 0; i <= N; i++){
	textureRatioArrayX[i] = [];
}
for(var i = 0; i <= N; i++){
	textureRatioArrayY[i] = [];
}

for(var i = 0; i <= N; i++){
	pointsArray[i] = [];
}
for(var i = 0; i <= N; i++){
	normalsArray[i] = [];
}

//Bound box coefficient
var boundBoxX = 1;
var boundBoxY = 1;
var boundBoxZ = 1;

//boolean for whether wireframe or normals shape
var wireFrame = 0;
var hyperboloid = 0;
var isPhong = 0;
var isEnvironmentMapping = 0;
   
//necessary stuff
var program;
var nBuffer;
var vNormal;
var vBuffer;
var vPosition;
var tBuffer;
var vTexCoord;

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
	aspect =  canvas.width/canvas.height;
	
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.7, 0.7, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);
	
	//For camera movement 
	canvas.addEventListener("mousedown", mouseDown, false);
	canvas.addEventListener("mousemove", mouseMove, false);
	canvas.addEventListener("wheel", myFunction, false);
	document.body.addEventListener("mouseup", mouseUp, false);
	
    environmentMapping();
		createEllipsoid(e1, e2);
	
	//create array to send to buffer
	if(wireFrame==0)
		dataToBuffer();
	else
		dataToBufferWireFrame();
	
	//////load texture
	loadTexture(gl, "https://art.pixilart.com/a9a5f1d1b0b0464.png");
	
	initiateProgram();

	
	camera = {};
	camera.lookat = {x : 0, y : 0, z : 0.2};
	camera.distance = 10;
	camera.phi = Math.PI/6;
	camera.theta = Math.PI/4;
	   
	document.getElementById("slider0").oninput = function() {
		e1 = event.srcElement.value;
		
		if(hyperboloid==1)
			createHyperboloid(e1, e2);
		else
			createEllipsoid(e1, e2);
		
		if(wireFrame==0)
			dataToBuffer();
		else
			dataToBufferWireFrame();
		gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsToBuffer), gl.STATIC_DRAW);
		
		gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsToBuffer), gl.STATIC_DRAW );
		
		gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );
    };
	
	document.getElementById("slider1").oninput = function() {
		e2 = event.srcElement.value;
		
		if(hyperboloid==1)
			createHyperboloid(e1, e2);
		else
			createEllipsoid(e1, e2);
		
		if(wireFrame==0)
			dataToBuffer();
		else
			dataToBufferWireFrame();
		gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsToBuffer), gl.STATIC_DRAW);
		
		gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsToBuffer), gl.STATIC_DRAW );
		
		gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );
    };
	
	document.getElementById("slider2").oninput = function() {
		N = event.srcElement.value;
		
		if(hyperboloid==1)
			createHyperboloid(e1, e2);
		else
			createEllipsoid(e1, e2);
		
		if(wireFrame==0)
			dataToBuffer();
		else
			dataToBufferWireFrame();
		gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsToBuffer), gl.STATIC_DRAW);
		
		gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsToBuffer), gl.STATIC_DRAW );
		
		gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );
		//console.log(e2);
    };
	
	document.getElementById("slider3").oninput = function() {
		W = event.srcElement.value;
		
		if(hyperboloid==1)
			createHyperboloid(e1, e2);
		else
			createEllipsoid(e1, e2);
		
		if(wireFrame==0)
			dataToBuffer();
		else
			dataToBufferWireFrame();
		gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsToBuffer), gl.STATIC_DRAW);
		
		gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsToBuffer), gl.STATIC_DRAW );
		
		gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );
		//console.log(e2);
    };
	
	document.getElementById("changeRepresentation").onclick = function(){
		wireFrame = (wireFrame+1)%2;
		if(wireFrame==0)
			dataToBuffer();
		else
			dataToBufferWireFrame();
		
		gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsToBuffer), gl.STATIC_DRAW);
		
		gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsToBuffer), gl.STATIC_DRAW );
		
		gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );
	};
	

	
	document.getElementById("gouraudShade").onclick = function(){
		if(isPhong==0)
			return;
		else{
			isPhong = 0;
			initiateProgram();
		}
	};
	
	document.getElementById("phongShade").onclick = function(){
		if(isPhong==1)
			return;
		else{
			isPhong = 1;
			initiateProgram();
		}
	};
	
	document.getElementById("environmentMapping").onclick = function(){
		isEnvironmentMapping = (isEnvironmentMapping+1)%2;
		
		initiateProgram();
	};
	
	document.getElementById("slider6").oninput = function() {
		boundBoxX = event.srcElement.value;
		if(hyperboloid==1)
			createHyperboloid(e1, e2);
		else
			createEllipsoid(e1, e2);
		
		if(wireFrame==0)
			dataToBuffer();
		else
			dataToBufferWireFrame();
		gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsToBuffer), gl.STATIC_DRAW);
		
		gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsToBuffer), gl.STATIC_DRAW );
		
		gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );
    };
	
	document.getElementById("slider7").oninput = function() {
		boundBoxY = event.srcElement.value;
		if(hyperboloid==1)
			createHyperboloid(e1, e2);
		else
			createEllipsoid(e1, e2);
		
		if(wireFrame==0)
			dataToBuffer();
		else
			dataToBufferWireFrame();
		gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsToBuffer), gl.STATIC_DRAW);
		
		gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsToBuffer), gl.STATIC_DRAW );
		
		gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );
    };
	
	document.getElementById("slider8").oninput = function() {
		boundBoxZ = event.srcElement.value;
		if(hyperboloid==1)
			createHyperboloid(e1, e2);
		else
			createEllipsoid(e1, e2);
		
		if(wireFrame==0)
			dataToBuffer();
		else
			dataToBufferWireFrame();
		gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsToBuffer), gl.STATIC_DRAW);
		
		gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsToBuffer), gl.STATIC_DRAW );
		
		gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );
    };

    render();
}

function initiateProgram(){
	if(isEnvironmentMapping == 1){
		program = initShaders( gl, "vertex-shader-Environment-Mapping", "fragment-shader-Environment-Mapping" );
	}
	else{
		if(isPhong == 1)
			program = initShaders( gl, "vertex-shader-Phong", "fragment-shader-Phong" );
		else
			program = initShaders( gl, "vertex-shader-Gouraud", "fragment-shader-Gouraud" );
	}
	
	
    gl.useProgram( program );
	
	nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsToBuffer), gl.STATIC_DRAW );
    
    vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsToBuffer), gl.STATIC_DRAW);
    
    vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
	tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );
    vTexCoord = gl.getAttribLocation( program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);
	
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );
	
	ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
	
	gl.uniform4fv( gl.getUniformLocation(program, 
       "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "specularProduct"),flatten(specularProduct) );	
    gl.uniform4fv( gl.getUniformLocation(program, 
       "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, 
       "shininess"),materialShininess );
}

function environmentMapping(){
	
	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

	const faceInfos = [
		{
		  target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, 
		  url: 'https://webglfundamentals.org/webgl/resources/images/computer-history-museum/pos-x.jpg'
		},
		{
		  target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 
		  url: 'https://webglfundamentals.org/webgl/resources/images/computer-history-museum/neg-x.jpg'
		},
		{
		  target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 
		  url: 'https://webglfundamentals.org/webgl/resources/images/computer-history-museum/pos-y.jpg'
		},
		{
		  target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 
		  url: 'https://webglfundamentals.org/webgl/resources/images/computer-history-museum/neg-y.jpg'
		},
		{
		  target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 
		  url: 'https://webglfundamentals.org/webgl/resources/images/computer-history-museum/pos-z.jpg'
		},
		{
		  target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 
		  url: 'https://webglfundamentals.org/webgl/resources/images/computer-history-museum/neg-z.jpg'
		},
	  ];
	  faceInfos.forEach((faceInfo) => {
		const {target, url} = faceInfo;

		// Upload the canvas to the cubemap face.
		const level = 0;
		const internalFormat = gl.RGBA;
		const width = 512;
		const height = 512;
		const format = gl.RGBA;
		const type = gl.UNSIGNED_BYTE;
		
		// setup each face so it's immediately renderable
		gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);

		// Asynchronously load an image
		const image = new Image();
		image.crossOrigin = "anonymous";
		image.src = url;
		image.addEventListener('load', function() {
		  // Now that the image has loaded make copy it to the texture.
		  gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
		  gl.texImage2D(target, level, internalFormat, format, type, image);
		  gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
		});
	  });
}

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

function loadTexture(gl, url) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]); 
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                pixel);

  const image = new Image();
  image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  srcFormat, srcType, image);
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
       gl.generateMipmap(gl.TEXTURE_2D);
    } else {
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.crossOrigin = "anonymous";
  image.src = url;

  return texture;
}

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}

function dataToBuffer(){
	pointsToBuffer = [];
	normalsToBuffer = [];
	texCoordsArray = [];
	
	var temp;
	if(hyperboloid==1){
		temp = N-2;
		temp2 = 2;
	}
	else{
		temp = N;
		temp2 = 0;
	}
	for(var i = temp2; i < temp; ++i){
		for(var j = 0; j < W; ++j){
			pointsToBuffer.push(pointsArray[i][j]);
			texCoordsArray.push(vec2(textureRatioArrayX[i][j], textureRatioArrayY[i][j]));
			pointsToBuffer.push(pointsArray[i][j+1]);
			texCoordsArray.push(vec2(textureRatioArrayX[i][j+1], textureRatioArrayY[i][j+1]));
			pointsToBuffer.push(pointsArray[i+1][j+1]);
			texCoordsArray.push(vec2(textureRatioArrayX[i+1][j+1], textureRatioArrayY[i+1][j+1]));
			
			pointsToBuffer.push(pointsArray[i][j]);
			texCoordsArray.push(vec2(textureRatioArrayX[i][j], textureRatioArrayY[i][j]));
			pointsToBuffer.push(pointsArray[i+1][j+1]);
			texCoordsArray.push(vec2(textureRatioArrayX[i+1][j+1], textureRatioArrayY[i+1][j+1]));
			pointsToBuffer.push(pointsArray[i+1][j]);
			texCoordsArray.push(vec2(textureRatioArrayX[i+1][j], textureRatioArrayY[i+1][j]));
			
			normalsToBuffer.push(normalsArray[i][j]);
			normalsToBuffer.push(normalsArray[i][j+1]);
			normalsToBuffer.push(normalsArray[i+1][j+1]);
			
			normalsToBuffer.push(normalsArray[i][j]);
			normalsToBuffer.push(normalsArray[i+1][j+1]);
			normalsToBuffer.push(normalsArray[i+1][j]);
		}
	}
}

function dataToBufferWireFrame(){
	pointsToBuffer = [];
	normalsToBuffer = [];
	texCoordsArray = [];
	
	var temp;
	if(hyperboloid==1){
		temp = N-2;
		temp2 = 2;
	}else{
		temp = N;
		temp2 = 0;
	}
	
	for(var i = temp2; i < temp; ++i){
		for(var j = 0; j < W; ++j){
			pointsToBuffer.push(pointsArray[i][j]);
			texCoordsArray.push(vec2(textureRatioArrayX[i][j], textureRatioArrayY[i][j]));
			pointsToBuffer.push(pointsArray[i][j+1]);
			texCoordsArray.push(vec2(textureRatioArrayX[i][j+1], textureRatioArrayY[i][j+1]));
			
			pointsToBuffer.push(pointsArray[i][j+1]);
			texCoordsArray.push(vec2(textureRatioArrayX[i][j+1], textureRatioArrayY[i][j+1]));
			pointsToBuffer.push(pointsArray[i+1][j+1]);
			texCoordsArray.push(vec2(textureRatioArrayX[i+1][j+1], textureRatioArrayY[i+1][j+1]));
			
			pointsToBuffer.push(pointsArray[i+1][j+1]);
			texCoordsArray.push(vec2(textureRatioArrayX[i+1][j+1], textureRatioArrayY[i+1][j+1]));
			pointsToBuffer.push(pointsArray[i][j]);
			texCoordsArray.push(vec2(textureRatioArrayX[i][j], textureRatioArrayY[i][j]));
			
			pointsToBuffer.push(pointsArray[i+1][j+1]);
			texCoordsArray.push(vec2(textureRatioArrayX[i+1][j+1], textureRatioArrayY[i+1][j+1]));
			pointsToBuffer.push(pointsArray[i+1][j]);
			texCoordsArray.push(vec2(textureRatioArrayX[i+1][j], textureRatioArrayY[i+1][j]));
			
			pointsToBuffer.push(pointsArray[i+1][j]);
			texCoordsArray.push(vec2(textureRatioArrayX[i+1][j], textureRatioArrayY[i+1][j]));
			pointsToBuffer.push(pointsArray[i][j]);
			texCoordsArray.push(vec2(textureRatioArrayX[i][j], textureRatioArrayY[i][j]));
			
			normalsToBuffer.push(normalsArray[i][j]);
			normalsToBuffer.push(normalsArray[i][j+1]);
			
			normalsToBuffer.push(normalsArray[i][j+1]);
			normalsToBuffer.push(normalsArray[i+1][j+1]);
			
			normalsToBuffer.push(normalsArray[i+1][j+1]);
			normalsToBuffer.push(normalsArray[i][j]);
			
			normalsToBuffer.push(normalsArray[i+1][j+1]);
			normalsToBuffer.push(normalsArray[i+1][j]);
			
			normalsToBuffer.push(normalsArray[i+1][j]);
			normalsToBuffer.push(normalsArray[i][j]);
		}
	}
}


function createEllipsoid(e1, e2){
	for(var i = 0; i <= N; i++){
		pointsArray[i] = [];
	}
	for(var i = 0; i <= N; i++){
		normalsArray[i] = [];
	}
	
	for(var i = 0; i <= W; i++){
		textureDistanceArrayY[i] = 0;
	}
	for(var i = 0; i <= N; i++){
		textureDistanceArrayX[i] = 0;
	}

	for(var i = 0; i <= N; i++){
		textureRatioArrayX[i] = [];
	}
	for(var i = 0; i <= N; i++){
		textureRatioArrayY[i] = [];
	}
	
	var x, y, z;
	var nx, ny, nz;
	var temp;
	for(var i = 0; i <= N; ++i){ //n
		for(var j = 0; j <= W; ++j){ //w
			
			var w = (2 * Math.PI / W) * j - Math.PI;	//w
			var n = (Math.PI / N) * i - Math.PI / 2;	//n
			
			if(Math.abs(Math.cos(n)) < 0.000000005 || Math.abs(Math.cos(w)) < 0.000000005 )
				x = 0;
			else
				x = boundBoxX*Math.cos(n) * Math.pow(Math.abs(Math.cos(n)),(2.0/e1) - 1) * Math.cos(w) * Math.pow(Math.abs(Math.cos(w)),(2.0/e2) - 1);
			
			if(Math.abs(Math.cos(n)) < 0.000000005 || Math.abs(Math.sin(w)) < 0.00000005)
				y = 0;
			else
				y =  boundBoxY*Math.cos(n) * Math.pow(Math.abs(Math.cos(n)),(2.0/e1) - 1) * Math.sin(w) * Math.pow(Math.abs(Math.sin(w)),(2.0/e2) - 1);
			if(Math.abs(Math.sin(n)) < 0.000000005)
				z = 0;
			else
				z = boundBoxZ*Math.sin(n) * Math.pow(Math.abs(Math.sin(n)),(2.0/e1) - 1);
			
			temp = vec4(x, y, z, 1.0);
			pointsArray[i].push(temp);
			
			if(Math.abs(Math.cos(n)) < 0.000000005 || Math.abs(Math.cos(w)) < 0.000000005 ){
				nx = 0;
			}else
				nx = (1/boundBoxX)*Math.cos(n)*Math.pow(Math.abs(Math.cos(n)), 1-2/e1)*Math.cos(w)*Math.pow(Math.abs(Math.cos(w)), 1-2/e2);
			
			if(Math.abs(Math.cos(n)) < 0.000000005 || Math.abs(Math.sin(w)) < 0.000000005 ){
				ny = 0;
			}else
				ny = (1/boundBoxY)*Math.cos(n)*Math.pow(Math.abs(Math.cos(n)), 1-2/e1)*Math.sin(w)*Math.pow(Math.abs(Math.sin(w)), 1-2/e2);
			
			if(Math.abs(Math.sin(n)) < 0.000000005 ){
				nz = 0;
			}else
				nz = (1/boundBoxZ)*Math.sin(n)*Math.pow(Math.abs(Math.sin(n)), 1-2/e1);
			
			temp = vec4(nx, ny, nz, 0.0)
			normalsArray[i].push(temp);
			
			if(j > 0){
				textureDistanceArrayX[i] += Math.sqrt(Math.pow((pointsArray[i][j][0] - pointsArray[i][j-1][0]), 2) + Math.pow((pointsArray[i][j][1] - pointsArray[i][j-1][1]), 2) + Math.pow((pointsArray[i][j][2] - pointsArray[i][j-1][2]), 2));
			}
			
			if(i > 0){
				textureDistanceArrayY[j] += Math.sqrt(Math.pow((pointsArray[i][j][0] - pointsArray[i-1][j][0]), 2) + Math.pow((pointsArray[i][j][1] - pointsArray[i-1][j][1]), 2) + Math.pow((pointsArray[i][j][2] - pointsArray[i-1][j][2]), 2));
				
			}
		}
	}
	
	var d;
	for(var i = 0; i <= N; ++i){ //n
		d = 0;
		for(var j = 0; j <= W; ++j){ 
			if(j == 0) {
				textureRatioArrayX[i][j] = 0;
			}else{
				d += Math.sqrt(Math.pow((pointsArray[i][j][0] - pointsArray[i][j-1][0]), 2) + Math.pow((pointsArray[i][j][1] - pointsArray[i][j-1][1]), 2) + Math.pow((pointsArray[i][j][2] - pointsArray[i][j-1][2]), 2));
				textureRatioArrayX[i][j] = d/textureDistanceArrayX[i];
			}
		}
	}
	
	for(var j = 0; j <= W; ++j){ //n
		d = 0;
		for(var i = 0; i <= N; ++i){ 
			if(i == 0) {
			}else{
				d += Math.sqrt(Math.pow((pointsArray[i][j][0] - pointsArray[i-1][j][0]), 2) + Math.pow((pointsArray[i][j][1] - pointsArray[i-1][j][1]), 2) + Math.pow((pointsArray[i][j][2] - pointsArray[i-1][j][2]), 2));
				textureRatioArrayY[i][j] = d/textureDistanceArrayY[j];
			}
		}
	}
}

function createHyperboloid(e1, e2){
	for(var i = 0; i < N; i++){
		pointsArray[i] = [];
	}
	for(var i = 0; i < N; i++){
		normalsArray[i] = [];
	}
	
	var x, y, z;
	var nx, ny, nz;
	var temp;
	for(var i = 0; i <= N; ++i){ //n
		for(var j = 0; j <= W; ++j){ //w
			
			var w = (2 * Math.PI / W) * j - Math.PI;	//w
			var n = (Math.PI / N) * i - Math.PI / 2;	//n
			
			if(Math.abs(1/Math.cos(n)) < 0.000000005 || Math.abs(Math.cos(w)) < 0.000000005 )
				x = 0;
			else
				x = boundBoxX*(1/Math.cos(n)) * Math.pow(Math.abs(1/Math.cos(n)),2.0/e1 - 1) * Math.cos(w) * Math.pow(Math.abs(Math.cos(w)),2.0/e2 - 1);
			
			if(Math.abs(1/Math.cos(n)) < 0.000000005 || Math.abs(Math.sin(w)) < 0.00000005)
				y = 0;
			else
				y =  boundBoxY*(1/Math.cos(n)) * Math.pow(Math.abs(1/Math.cos(n)),2.0/e1 - 1) * Math.sin(w) * Math.pow(Math.abs(Math.sin(w)),2.0/e2 - 1);
			if(Math.abs(Math.tan(n)) < 0.000000005)
				z = 0;
			else
				z = boundBoxZ*Math.tan(n) * Math.pow(Math.abs(Math.tan(n)),2.0/e1 - 1);
			
			temp = vec4(x, y, z, 1.0);
			pointsArray[i].push(temp);
			
			if(Math.abs(1/Math.cos(n)) < 0.000000005 || Math.abs(Math.cos(w)) < 0.000000005 ){
				nx = 0;
			}else
				nx = (1/boundBoxX)*(1/Math.cos(n))*Math.pow(Math.abs(1/Math.cos(n)), 1 - 2/e1)*Math.cos(w)*Math.pow(Math.abs(Math.cos(w)), 1-2/e2);
			
			if(Math.abs(1/Math.cos(n)) < 0.000000005 || Math.abs(Math.sin(w)) < 0.000000005 ){
				ny = 0;
			}else
				ny = (1/boundBoxY)*(1/Math.cos(n))*Math.pow(Math.abs(1/Math.cos(n)), 1 - 2/e1)*Math.sin(w)*Math.pow(Math.abs(Math.sin(w)), 1-2/e2);
			
			if(Math.abs(Math.tan(n)) < 0.000000005 ){
				nz = 0;
			}else
				nz = (1/boundBoxZ)*Math.tan(n)*Math.pow(Math.abs(Math.tan(n)), 1 - 2/e1);
			
			temp = vec4(nx, ny, nz, 0.0)
			normalsArray[i].push(temp);
			
		}
	}
	
}
	camera = {};
	function getMousePos(canvas, event) {
		var rect = canvas.getBoundingClientRect();
		return {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top
		};
	}
	var mouseDrag;
	function mouseDown(event) {
		mouseDrag = getMousePos(canvas, event);
	}
	var radiansPerPixel = 0.01;
	var phiMin = -Math.PI/2 + 0.001;
	var phiMax = +Math.PI/2 - 0.001;
	var frame;
	function mouseMove(event) {
		if (mouseDrag) {
			var mousePos = getMousePos(canvas, event);
			var dx = mousePos.x - mouseDrag.x;
			var dy = mousePos.y - mouseDrag.y;
			camera.theta += dx*radiansPerPixel;
			camera.phi += dy*radiansPerPixel;
			if (camera.phi < phiMin)
				camera.phi = phiMin;
			else if (camera.phi > phiMax)
				camera.phi = phiMax;
			mouseDrag = mousePos;
			if (!frame)
				frame = requestAnimationFrame(render);
		}
	}
	function mouseUp(event) {
		var mousePos = getMousePos(canvas, event);
		mouseDrag = null;
	}
	function myFunction() {
		var e = window.event || e; // old IE support
		var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
		camera.distance += -delta/2;
		if (!frame)
				frame = requestAnimationFrame(render);
	}
	function getCameraPosition() {
		var d_cos_phi = camera.distance*Math.cos(camera.phi);
		camera.x = d_cos_phi*Math.sin(camera.theta) + camera.lookat.x;
		camera.y = d_cos_phi*Math.cos(camera.theta) + camera.lookat.y;
		camera.z = camera.distance*Math.sin(camera.phi) + camera.lookat.z;
	}

function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    eye = vec3(radius*Math.sin(theta)*Math.cos(phi), 
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));
		
	getCameraPosition();
	
	modelViewMatrix = lookAt(vec3(camera.x, camera.y, camera.z), vec3(camera.lookat.x, camera.lookat.y, camera.lookat.z), vec3(0, 0, 1));

	projectionMatrix = perspective(30, 1, 0.1, 100);
    
    normalMatrix = [
        vec3(modelViewMatrix[0][0], modelViewMatrix[0][1], modelViewMatrix[0][2]),
        vec3(modelViewMatrix[1][0], modelViewMatrix[1][1], modelViewMatrix[1][2]),
        vec3(modelViewMatrix[2][0], modelViewMatrix[2][1], modelViewMatrix[2][2])
    ];
            
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
	gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix) );
	
	if(wireFrame==0)
		gl.drawArrays(gl.TRIANGLES, 0, pointsToBuffer.length);
	else
		gl.drawArrays(gl.LINES, 0, pointsToBuffer.length);

    window.requestAnimFrame(render);
}
