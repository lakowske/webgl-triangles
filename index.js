var mat4 = require('gl-mat4');

// Adds a canvas to the parent element and start rendering the scene
function add(parentEL, vert, frag) {

    var glCanvas = getCanvas(parentEL);

    //Create a matrix to transform the triangle
    var matrix = mat4.create();
    //Move it back 4 units
    mat4.translate(matrix, matrix, [0.0, 0.0, -3.0]);
    
    attacheMouseListeners(glCanvas, matrix);
    
    glCanvas.gl.enable(glCanvas.gl.DEPTH_TEST);
    
    //create a simple renderer for a simple triangle
    var renderer = simpleRenderer(glCanvas.gl, 1, vert, frag, new Float32Array([-0.5,-0.5,-1.0,0.0,0.5,-1.0,0.5,-0.5,-1.0]));


    //Called when a frame is scheduled.  A rapid sequence of scene draws creates the animation effect.
    var renderFn = function(timestamp) {

        mat4.rotateY(matrix, matrix, Math.PI/512);
        renderer(matrix, [1, 0, 0]);
        var second = mat4.create();
        mat4.rotateY(second, matrix, 2*Math.PI/3);
        renderer(second, [0, 1, 0]);
        var third = mat4.create();
        mat4.rotateY(third, second, 2*Math.PI/3);
        renderer(third, [0, 0, 1]);
        window.requestAnimationFrame(renderFn);
    }

    window.requestAnimationFrame(renderFn);

}

// Get A WebGL context
function getCanvas(parent) {
    //Create a canvas with specified attributes and append it to the parent.
    var canvas = document.createElement('canvas');
    canvas.width = 960;
    canvas.height = 1024;
    
    var div    = document.createElement('div');
    canvas.setAttribute('id', 'mycanvas');
    div.setAttribute('id', 'glcanvas');
    parent.appendChild(div);
    div.appendChild(canvas);
    
    var gl     = canvas.getContext('webgl');
    return {canvas: canvas, gl : gl}
}

function attacheMouseListeners(canvas, matrix) {
    
    document.onmousemove = handleMouseMove(matrix);
    
}

function handleMouseMove(matrix) {

    var lastX = 0;
    var lastY = 0;
    return function( event ) {

        var x = event.clientX;
        var y = event.clientY;

        var diffX = x - lastX;
        var diffY = y - lastY;
        
        mat4.rotateY(matrix, matrix, (diffX/960) * Math.PI);
        mat4.rotateX(matrix, matrix, (diffY/1024) * Math.PI);

        lastX = x;
        lastY = y;
    }
}

//Returns a simple rendering function that draws the passed in vertices.
function simpleRenderer(gl, aspect, vert, frag, vertices) {

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vert());
    gl.compileShader(vertexShader);
    
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, frag());
    gl.compileShader(fragmentShader);
    
    var shaders = [vertexShader, fragmentShader];
    var program = gl.createProgram();
    shaders.forEach(function(shader) {
        gl.attachShader(program, shader);
    })
    gl.linkProgram(program);
    
    return function(parentNode, color) {
        gl.clear(gl.GL_COLOR_BUFFER_BIT);

        //Field of view is very similar to a cameras field of view.
        var fieldOfView = Math.PI/2;
        //Far edge of scene defines how far away an object can be from the camera before it disappears.
        var farEdgeOfScene = 100;
        //Near edge of scene defines how close an object can be from the camera before it disappears.
        var nearEdgeOfScene = 1;

        //Creates a perspective transformation from the above parameters.
        var perspective = mat4.perspective(mat4.create(), fieldOfView, aspect, nearEdgeOfScene, farEdgeOfScene);
        //Apply perspective to the parent transformation (translate + rotation)
        var projection = mat4.multiply(mat4.create(), perspective, parentNode);
        
        gl.useProgram(program);
        
        var matrixLocation = gl.getUniformLocation(program, "u_matrix");
    
        // Set the matrix.
        gl.uniformMatrix4fv(matrixLocation, false, projection);

        // set the color
        var colorLocation = gl.getUniformLocation(program, "u_color");
        gl.uniform4f(colorLocation, color[0], color[1], color[2], 1.0);
        
        // Create a buffer for the positions
        var vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        
        // look up where the vertex data needs to go.
        var positionLocation = gl.getAttribLocation(program, "a_position");
    
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.drawArrays(gl.TRIANGLES, 0, vertices.length/3);
    }

}

module.exports = add;
