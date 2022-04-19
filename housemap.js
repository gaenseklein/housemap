housemap = {
  level:[],
  counter:{
    path:0,
    foto:0,
    label:0,
    object:0,
  },
  creatinglevel:{
    paths:[],
    objects:[],
    labels:[],
    fotos:[],
    path:{},
  },
  init: function(){

  },
  saveLevel: function(){

  },
  chooseCreatorType: function(radioname){
    levelcreator.className=radioname;
  },
  createNewPath: function(){
    housemap.counter.path++;
    let path={
      id:housemap.counter.path,
      startx:500,
      starty:250,
      waypoints:[],
    }
    let pathdiv=document.createElement('div');
    pathdiv.classList.add('pathpoint');
    pathdiv.id='path'+path.id;
    pathdiv.name=path.id
    pathdiv.isCircle=true;
    dragElement(pathdiv,function(elm){
      housemap.editPath(elm.name);
    }, function(elm){
      let nx=elm.offsetLeft+(elm.offsetWidth/2);
      let ny=elm.offsetTop+(elm.offsetHeight/2);
      let difx=nx-path.startx;
      let dify=ny-path.starty;
      path.startx=nx;
      path.starty=ny;
      for (let x=0;x<path.waypoints.length;x++){
        path.waypoints[x].x+=difx;
        path.waypoints[x].y+=dify;
      }
      housemap.drawPaths(housemap.creatinglevel.paths,levelgrundriss);
    });
    path.div=pathdiv;
    levelgrundrisspaths.appendChild(pathdiv);
    housemap.creatinglevel.paths.push(path);
  },
  createNewSquare: function(){
    housemap.counter.path++;
    let path={
      id:housemap.counter.path,
      startx:500,
      starty:250,
      waypoints:[{x:500+200,y:250},{x:500+200,y:250+200},{x:500,y:250+200}],
      width:200,
      height:200,
      square:true,
    }
    let pathdiv=document.createElement('div');
    pathdiv.classList.add('pathpoint');
    pathdiv.id='path'+path.id;
    pathdiv.name=path.id
    pathdiv.classList.add('square');
    pathdiv.isCircle=true;
    dragElement(pathdiv,function(elm){
      housemap.editPathSquare(elm.name)
    }, function(elm){
      let nx=elm.offsetLeft+(elm.offsetWidth/2);
      let ny=elm.offsetTop+(elm.offsetHeight/2);
      let difx=nx-path.startx;
      let dify=ny-path.starty;
      path.startx=nx;
      path.starty=ny;
      for (let x=0;x<path.waypoints.length;x++){
        path.waypoints[x].x+=difx;
        path.waypoints[x].y+=dify;
      }
      housemap.drawPaths(housemap.creatinglevel.paths,levelgrundriss);
    });
    path.div=pathdiv;
    levelgrundrisspaths.appendChild(pathdiv);
    housemap.creatinglevel.paths.push(path);
  },
  returnToPaths: function(){
    levelmap.className='';
    levelcreator.classList.remove('editPath');
  },
  deleteLastWaypoint: function(){
    this.creatinglevel.path.waypoints.pop();
    housemap.buildEditPath(this.creatinglevel.path);
  },
  deleteLastPath: function(){
    let ind=this.creatinglevel.paths.indexOf(this.creatinglevel.path);
    levelgrundrisspaths.removeChild(this.creatinglevel.path.div)
    this.creatinglevel.paths.splice(ind,1);
    this.drawPaths(this.creatinglevel.paths,levelgrundriss);
    this.returnToPaths();
  },
  editPath: function(id){
    let path=this.getPathById(id);
    levelmap.className='editPath';
    levelcreator.classList.add('editPath');
    this.creatinglevel.path=path;
    levelgrundrisswaypoints.onclick=function(e){
      if(e.target!=levelgrundrisswaypoints){
        console.log('klick auf point?',e.target)
        return;
      }
      console.log('waypoint at',e.x,e.y,e);
      housemap.creatinglevel.path.waypoints.push({
        x:e.x-levelmap.offsetLeft, y:e.y-levelmap.offsetTop
      })
      housemap.buildEditPath(path);
    }
    this.buildEditPath(path);
  },
  getPathById: function(id){
    let path;
    for (let x=0;x<this.creatinglevel.paths.length;x++){
      if(this.creatinglevel.paths[x].id==id){
        path=this.creatinglevel.paths[x];
        break;
      }
    }
    return path;
  },
  editPathSquare:function(id){
    let path=this.getPathById(id);
    levelmap.className='editPath';
    levelcreator.classList.add('editPath');
    this.creatinglevel.path=path;
    levelgrundrisswaypoints.onclick=undefined;
    this.buildEditPathSquare(path);
  },
  buildEditPathSquare(path){
    levelgrundrisswaypoints.innerHTML='';
    this.drawPaths(this.creatinglevel.paths,levelgrundriss);
    let sp = document.createElement('div');
    sp.className='waypoint startpoint square';
    sp.name='start';
    sp.style.top=path.starty+'px';
    sp.style.left=path.startx+'px';
    sp.isCircle=true;
    function buildSquare(){
      path.width=path.waypoints[1].x-path.startx;
      path.height=path.waypoints[1].y-path.starty;
      path.waypoints[0].x=path.waypoints[1].x;
      path.waypoints[0].y=path.starty;
      path.waypoints[2].x=path.startx;
      path.waypoints[2].y=path.waypoints[1].y;
    }
    dragElement(sp,null,function(elm){
      path.startx=elm.offsetLeft+(elm.offsetWidth/2);
      path.starty=elm.offsetTop+(elm.offsetHeight/2);
      buildSquare();
      housemap.buildEditPathSquare(path);
    });
    levelgrundrisswaypoints.appendChild(sp);
    for (let x=0;x<3;x++){
      let wp=document.createElement('div');
      wp.className='waypoint square';
      wp.name=x;
      wp.isCircle=true;
      wp.style.top=path.waypoints[x].y+'px';
      wp.style.left=path.waypoints[x].x+'px';
      if(x==1)dragElement(wp,null,function(elm){
        path.waypoints[1].x=elm.offsetLeft+(elm.offsetWidth/2);
        path.waypoints[1].y=elm.offsetTop+(elm.offsetHeight/2);
        buildSquare();
        housemap.buildEditPathSquare(path);
      }); else wp.style.display='none';
      levelgrundrisswaypoints.appendChild(wp);
    }
  },
  buildEditPath:function(path){

    levelgrundrisswaypoints.innerHTML='';
    this.drawPaths(this.creatinglevel.paths,levelgrundriss);
    let sp = document.createElement('div');
    sp.className='waypoint startpoint';
    sp.name='start';
    sp.style.top=path.starty+'px';
    sp.style.left=path.startx+'px';
    sp.isCircle=true;
    dragElement(sp,null,function(elm){
      path.startx=elm.offsetLeft+(elm.offsetWidth/2);
      path.starty=elm.offsetTop+(elm.offsetHeight/2);
      housemap.buildEditPath(path);
    })
    levelgrundrisswaypoints.appendChild(sp);
    for (let x=0;x<path.waypoints.length;x++){
      let wp=document.createElement('div');
      wp.className='waypoint';
      wp.name=x;
      wp.isCircle=true;
      wp.style.top=path.waypoints[x].y+'px';
      wp.style.left=path.waypoints[x].x+'px';
      dragElement(wp,null,function(elm){
        path.waypoints[elm.name]={
          x:elm.offsetLeft+(elm.offsetWidth/2),
          y:elm.offsetTop+(elm.offsetHeight/2)
        };
        housemap.buildEditPath(path);
      });
      levelgrundrisswaypoints.appendChild(wp);
    }
  },
  drawPath: function(path, targetsvg){
    let d='M'+path.startx+','+path.starty;
    for (let x=0;x<path.waypoints.length;x++){
      d+=' L'+path.waypoints[x].x+','+path.waypoints[x].y;
    }
    if(path.square)d+='Z'
    let svgpath= document.createElementNS("http://www.w3.org/2000/svg", 'path');
    // svgpath.setAttribute('style','fill:none;stroke:green;stroke-width:1px;stroke-linejoin:round;')
    svgpath.setAttribute('d',d);
    targetsvg.appendChild(svgpath);
  },
  drawPaths: function(paths,targetsvg){
    targetsvg.innerHTML='';
    for (let x=0;x<paths.length;x++){
      this.drawPath(paths[x],targetsvg);
    }
  },
}

var clicktimer;

//dragElement helper function
function dragElement(elmnt, clickfunction, followfunction) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    clicktimer=Date.now();
    e.preventDefault();
    if(document.body.classList.contains('config')){
      vorschaubild.src="fotos/IMG_"+this.name+".JPG";
    }
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    let top=(elmnt.offsetTop - pos2)
    let left=(elmnt.offsetLeft - pos1)
    if(elmnt.isCircle){
      top+=elmnt.offsetHeight/2;
      left+=elmnt.offsetWidth/2;
    }
    elmnt.style.top = top + "px";
    elmnt.style.left = left + "px";
    housemap.drawPaths(housemap.creatinglevel.paths,levelgrundriss);
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    if(Date.now()-clicktimer<200 && clickfunction){
      clickfunction(elmnt);
    }else if(followfunction){
      followfunction(elmnt);
    }
    document.onmouseup = null;
    document.onmousemove = null;
  }
}
