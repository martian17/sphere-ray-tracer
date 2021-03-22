var canvas = BODY.add("canvas");

var Field = function(){
    this.maxref = 3;
    var balls = [];
    var panels = [];
    this.addBall = function(x,y,z,r,color,light){
        balls.push([x,y,z,r,color,light]);
    };
    this.addPanel = function(x,y,z,c,color,light){
        planes.push([x,y,z,c,color,light]);
    }
    
    this.getClosestCollision = function(a,b,c,d,e,f){//abc start def vector
        var ks = Infinity;
        var cInfo = null;
        for(var i = 0; i < panels.length; i++){
            var [A,B,C,D,color,light] = panels[i];
            var k = (A*a+B*b+C*c+D)/(A*d+B*e+C*f);
            if(k < 0)continue;
            if(k < ks){
                cInfo = ["panel",panels[i]];
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
                    cInfo = ["sphere",panels[i]];
                }
            }
        }
        return cInfo;
    };
}



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


var rayTrace = function(w,h){//just plain old wh resolutions
    //just conpare whichever is smaller of wh and use that as reference 1
    var r = w<h?w:h;
    //gonna divide everything with r from now on
    //cenvert xy into 3d coordinate
    //do some camera conversion
    vecMat(camera);
    for(var y = 0; y < h; y++){
        for(var x = 0; x < h; x++){
            var i = (y*w+x)*4;
            
            
        }
    }
    if(){
        
    }
}