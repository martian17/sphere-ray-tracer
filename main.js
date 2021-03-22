var PANEL = 0;
var BALL = 1;//names to use in place of string
//optimization :D

var Field = function(){
    this.maxref = 3;
    var balls = [];
    var panels = [];
    var panelNormals = [];
    this.addBall = function(x,y,z,r,color,light){
        var ball = [x,y,z,r,color,light];
        balls.push(ball);
        return ball;
    };
    this.addPanel = function(A,B,C,D,color,light){
        panels.push([A,B,C,D,color,light]);
        var n;//n for normal
        //calculate the normal vector
        if(A === 0){//special case
            if(B === 0){
                n = [0,0,1];
            }else{
                n = [0,1,C/B];
            }
        }else{
            var n = [1,B/A,C/A];
        }
        panelNormals.push(n);
        console.log(n);
    }
    
    this.getClosestCollision = function(a,b,c,d,e,f){//abc start def vector
        var ks = Infinity;
        var cInfo = null;
        for(var i = 0; i < panels.length; i++){
            var [A,B,C,D,color,light] = panels[i];
            var k = (A*a+B*b+C*c+D)/(A*d+B*e+C*f);
            if(k < 0)continue;
            if(k < ks){
                cInfo = [PANEL,i];
                ks = k;
            }
        }
        for(var i = 0; i < balls.length; i++){
            var [X,Y,Z,R,color,light] = balls[i];
            var A = d*d+e*e+f*f;
            var B = d*a-d*X+e*b-e*Y+f*c-f*Z;
            var C = a*a+X*X-2*a*X+b*b+Y*Y-2*b*Y+c*c+Z*Z-2*c*Z-R*R;
            var det = B*B-A*C;
            if(det<0){
                continue;
            }//else if(det === 0){
            //    var k = -B/A; //dont use this part redundant
            //}
            else{
                var sq = Math.sqrt(det);
                var k1 = -(B+sq)/A;
                var k2 = -(B-sq)/A;
                var k = k1>k2?k2:k1;
                if(k < 0)continue;
                if(k < ks){
                    cInfo = [BALL,i];
                    ks = k;
                }
            }
        }
        if(cInfo === null){
            return null;
        }
        var obj;
        var x = a+ks*d;
        var y = b+ks*e;
        var z = c+ks*f;
        if(cInfo[0] === PANEL){//panel
            var normal = panelNormals[cInfo[1]];
            //return the new ray
            obj = panels[cInfo[1]];
        }else{//ball
            obj = balls[cInfo[1]];
            var normal = [x-obj[0],y-obj[1],z-obj[2]];
        }
        var projn = proj3(normal,[d,e,f]);
        
        return [[x,y,z,d-projn[0]*2,e-projn[1]*2,f-projn[2]*2],obj];
    };
}

var proj3 = function(a,b){//a base
    var dot = a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
    var magna2 = a[0]*a[0]+a[1]*a[1]+a[2]*a[2];
    var k = dot/magna2;
    return [a[0]*k,a[1]*k,a[2]*k];
};


//basic matrix funcs matrices are so POG!!
// |\      |^^^^^^|
//(°、。7　<__Pog!_|
// | ˜~＼
// じし　f_,)√
var camera = [
    1,0,0,0,
    0,1,0,0,
    0,0,1,0,
    0,0,0,1
];
var cos = Math.cos;
var sin = Math.sin;//ok not gonna use taylor series for that. That's stewpid lel

var genYmat = function(a){
    return [
        cos(a),0,sin(a),0,
        0,1,0,0,
        -sin(a),0,cos(a),0,
        0,0,0,1
        
    ];
};

var genXmat = function(a){
    return [
        1,0,0,0,
        0,cos(a),-sin(a),0,
        0,sin(a),cos(a),0,
        0,0,0,1
    ];
};
var genZmat = function(a){
    return [
        cos(a),-sin(a),0,0,
        sin(a),cos(a),0,0,
        0,0,1,0,
        0,0,0,1
    ];
};
//if I wanna do animation shit, I'll usee the xyz axis transfrmation function, but for now it's just static

var vecMat = function(vec,mat){//multiply to get the final shape
    var vec1 = [0,0,0,1];
    for(var i = 0; i < 3; i++){//its some minor optimization we dont use the last columb in the matrix
        for(var j = 0; j < 4; j++){
            vec1[i] += vec[j]*mat[j*4+i];
        }
    }
    return vec1;
};

var vecMat3 = function(vec,mat){//multiply to get the final shape
    var vec1 = [0,0,0];
    for(var i = 0; i < 3; i++){//its some minor optimization we dont use the last columb in the matrix
        for(var j = 0; j < 3; j++){
            vec1[i] += vec[j]*mat[j*4+i];
        }
    }
    return vec1;
};







// ok from here on comes the main part of the code
var canvas = document.getElementById("canvas");
var width = 500;
var height = 300;
canvas.width = width;
canvas.height = height;
var ctx = canvas.getContext("2d");
var imgdata = ctx.getImageData(0,0,width,height);
var data = imgdata.data;
var field = new Field();


var rayTrace = function(){
    var w = width;
    var h = height;
    var r = (w<h?w:h)*1;
    
    for(var y = 0; y < h; y++){
        for(var x = 0; x < w; x++){
            var i = (y*w+x)*4;
            var a = 0;
            var b = 0;
            var c = 0;
            var d = (x-w/2)/r;
            var e = (y-h/2)/r;
            var f = 1;
            //now transform this ray
            //transform abc
            [a,b,c] = vecMat([a,b,c,1],camera);
            [d,e,f] = vecMat3([d,e,f],camera);//now the ray is transformed
            var col = getColor(a,b,c,d,e,f,0);
            var red = Math.floor(255*col[0]);
            var gre = Math.floor(255*col[1]);
            var blu = Math.floor(255*col[2]);
            data[i+0] = red;
            data[i+1] = gre;
            data[i+2] = blu;
            data[i+3] = 255;
        }
    }
    ctx.putImageData(imgdata,0,0);
};



var getColor = function(a,b,c,d,e,f,depth){
    if(depth > 15){
        return [1,1,1];//tracking give up. returning a light source
    }else{
        var collision =  field.getClosestCollision(a,b,c,d,e,f);
        /*//test code
        if(collision){//only the depth
            var [a1,b1,c1,d1,e1,f1] = collision[0];
            var d = Math.sqrt(a1*a1+b1*b1+c1*c1);
            var b = 1/d*7
            return [b,b,b];
        }
        return [1,1,1];
        //end test code*/
        if(!collision){//no collision, free ray, back tracking
            return [1,1,1];
        }else{//if collision
            //calculate the normal vector
            var obj = collision[1];
            if(obj[5]){//5 is for the light
                return obj[5];
            }
            var [a1,b1,c1,d1,e1,f1] = collision[0];
            var color = getColor(a1,b1,c1,d1,e1,f1,depth+1);
            //then finally do the color adjustment
            //obj[4] is the color
            return [color[0]*obj[4][0],color[1]*obj[4][1],color[2]*obj[4][2]];
        }
    }
};

//field.addBall(0,0,10,3,[1,0.5,0.2],false);
field.addBall(0,0,11,3,[0.8,0.8,0.8],false);
field.addBall(10,0,10,3,[0.5,1,0.2],false);
var ball = field.addBall(-6,-3,7,1,[1,0,0],false);
field.addBall(0,170,140,210,[0.5,0.2,1],false);
field.addPanel(0,0,1,13,[0.8,0.8,0.8],false);

var animate = function(t){
    t = t/1000
    ball[0] = 5*Math.sin(t);
    ball[2] = 2*Math.cos(t)+10;
    rayTrace();
    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
rayTrace();