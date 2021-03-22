var canvas = BODY.add("canvas");

var PANEL = 0;
var SPHERE = 1;//names to use in place of string
//optimization :D

var Field = function(){
    this.maxref = 3;
    var balls = [];
    var panels = [];
    var panelNormals = [];
    this.addBall = function(x,y,z,r,color,light){
        balls.push([x,y,z,r,color,light]);
    };
    this.addPanel = function(A,B,C,D,color,light){
        planes.push([A,B,C,D,color,light]);
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
            }
        }
        for(var i = 0; i < balls.length; i++){
            var [X,Y,Z,R,color,light] = panels[i];
            var A = d*d+e*e+f*f;
            var B = d*a-d*X+e*b-e*Y+f*c-f*Z;
            var C = a*a+X*X-2*a*x+b*b+Y*Y-2*b*Y+c*c+Z*Z-2*c*Z;
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
                    cInfo = [SPHERE,i];
                }
            }
        }
        
        if(!cInfo){
            return null;
        }
        var obj;
        var x = a+k*d;
        var y = b+k*e;
        var z = c+k*f;
        if(cInfo[0] === PANEL){//panel
            var normal = panelNormals[i];
            //return the new ray
            obj = panels[cInfo[1]];
        }else{//sphere
            obj = panels[cInfo[1]];
            var normal = [x-obj[0],y-obj[1],z-obj[2]];
        }
        var projn = proj3(normal,[d,e,f]);
        
        return [[x,y,z,d-projn[0]*2,d-projn[1]*2,d-projn[2]*2],obj];
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


var rayTrace = function(w,h){
    var r = (w<h?w:h)/2;
    for(var y = 0; y < h; y++){
        for(var x = 0; x < h; x++){
            var i = (y*w+x)*4;
            var a = 0;
            var b = 0;
            var c = 0;
            var d = (x-w/2)/r;
            var e = (y-h/2)/r;
            var f = 1;
            //now transform this ray
            //transform abc
            [a,b,c] = vecMat([a,b,c],camera);
            [d,e,f] = vecMat3([d,e,f],camera);//now the ray is transformed
            var col = getColor(a,b,c,d,e,f,0);
        }
    }
};

var getColor = function(a,b,c,d,e,f,dpeth){
    if(depth > 5){
        return [1,1,1];//tracking give up. returning a light source
    }else{
        var collision =  Field.getClosestCollision(a,b,c,d,e,f);
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
