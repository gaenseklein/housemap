housemap = {
  level:[],
  counter:{
    path:0,
    foto:0,
    label:0,
    object:0,
    level:0,
  },
  creatinglevel:{
    paths:[],
    objects:[],
    labels:[],
    fotos:[],
    path:{},
    name:'',
  },
  pendingfotos:[],
  fontsizes:[
    "initial",
    'large',
    'larger',
    'x-large',
    'xx-large',
    'xxx-large'
  ],
  init: function(){
    this.creatinglevel.name='eg'
    this.creatinglevel.id=0;
    this.level.push(this.creatinglevel);
  },
  saveMap: function(exportoptions){
    let savetext='';
    if(exportoptions.json){
      let saveobj = JSON.parse(JSON.stringify(this.level));
      savetext = JSON.stringify(saveobj);
      // savetext = 'var start=`'+savetext+'`;';
      var a = document.createElement("a");
      a.href = window.URL.createObjectURL(new Blob([savetext], {type: "text/plain"}));
      a.download = "fotomap.json";
      a.click();
    }
    if(exportoptions.html){
      savetext=this.createHTMLPage();
      var a = document.createElement("a");
      a.href = window.URL.createObjectURL(new Blob([savetext], {type: "text/plain"}));
      a.download = "fotomap.htm";
      a.click();
    }
  },
  loadMap: function(){
    let fi=document.createElement('input');
    fi.type="file";
    fi.onchange=function(){
      let file=this.files[0];
      let reader = new FileReader();
      reader.onload=function(e){
        try {
          let payload=JSON.parse(reader.result);
          if(payload){
            housemap.loadData(payload);
          }
        } catch (e) {
          console.warn('no json?',e)
        }
      }
      reader.readAsText(file);
    }
    fi.click();
  },
  loadData: function(leveldata){
    console.log('loading',leveldata);
    housemap.level=leveldata;
    levelchoose.innerHTML='';
    for (let x=0;x<leveldata.length;x++){
      let opt= document.createElement('option');
      opt.value=leveldata[x].id;
      opt.innerText=leveldata[x].name;
      levelchoose.appendChild(opt);
      for (let p=0;p<leveldata[x].paths.length;p++){
        leveldata[x].paths[p].div=this.createPathDiv(leveldata[x].paths[p])
      }
      for(let o=0;o<leveldata[x].objects.length;o++){
        let ob=leveldata[x].objects[o];
        ob.svg=document.createElement('div');
        ob.svg.innerHTML=ob.innerHTML;
        this.finalizeObjectDiv(ob)
        console.log(ob)
      }
      for(let l=0;l<leveldata[x].labels.length;l++){
        let lab=leveldata[x].labels[l];
        this.addDivToLabel(lab);
        levellabel.appendChild(lab.div)
        lab.div.style.left=lab.x+'px'
        lab.div.style.top=lab.y+'px'
      }
      for(let fl=0;fl<leveldata[x].fotos.length;fl++){
        let fotol=leveldata[x].fotos[fl]
        this.addDivToFotolink(fotol)
        // fotol.div.style.left=fotol.x+'px'
        // fotol.div.style.top=fotol.y+'px'
      }
      this.counter.path+=leveldata[x].paths.length;
      this.counter.foto+=leveldata[x].fotos.length;
      this.counter.label+=leveldata[x].labels.length;
      this.counter.object+=leveldata[x].objects.length;
    }
    let lopt= document.createElement('option');
    lopt.value="newLevel";
    lopt.innerText="add new level"
    levelchoose.appendChild(lopt)

    levelchoose.value=leveldata[0].id;
    this.creatinglevel=leveldata[0];
    levelchoose.value=leveldata[0].id;
    levelcreatoroldname.value=leveldata[0].name;
    levelcreatorname.value=leveldata[0].name;
    this.counter.level+=leveldata.length;

    this.rebuildLevel();
  },
  chooseCreatorType: function(radioname){
    levelcreator.className=radioname;
    levelmap.className='';
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
    path.div= this.createPathDiv(path);
    levelgrundrisspaths.appendChild(path.div);
    housemap.creatinglevel.paths.push(path);
    this.drawPaths(housemap.creatinglevel.paths,levelgrundriss);
  },
  createPathDiv: function(path){
    let pathdiv=document.createElement('div');
    pathdiv.classList.add('pathpoint');
    pathdiv.id='path'+path.id;
    pathdiv.name=path.id
    pathdiv.classList.add('square');
    pathdiv.isCircle=true;
    pathdiv.style.left=path.startx+'px'
    pathdiv.style.top=path.starty+'px'
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
    return pathdiv;
  },
  drawPathPoints: function(){
    levelgrundrisspaths.innerHTML='';
    for (let x=0;x<this.creatinglevel.paths.length;x++){
      levelgrundrisspaths.appendChild(this.creatinglevel.paths[x].div);
    }
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
  buildEditPathSquare:function(path){
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
    // sp.ondblclick=function(){
    //   path.closePath=true;
    // }
    dragElement(sp,function(elm){
      if(sp.lastClick && Date.now()-sp.lastClick<300){
        //doubleclick:
        console.log('doubleclick')
        path.closePath=true;
        housemap.drawPaths(housemap.creatinglevel.paths,levelgrundriss);
      }
      console.log('click',sp.lastClick)
      sp.lastClick=Date.now();
    },function(elm){
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
    if(path.square || path.closePath)d+='Z'
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
  uploadBackground: function(){
    let file = backgroundupload.files[0];
    // let nombre = backgroundupload.files[0].name;
		let imageType = /image.*/;
    if (file.type.match(imageType)){
      let reader = new FileReader();
      reader.onload = function(e){
        housemap.creatinglevel.background=reader.result;
        backgroundupload.value="";
        // levelmap.style.backgroundImage='url('+reader.result+')';
        // lm=document.querySelector('#levelmap .levelmeter');
        // lm.style.display='none';
        // deletebackgroundbutton.disabled=false;
        housemap.drawBackground();
      }
      reader.readAsDataURL(file);
    }
  },
  drawBackground: function(){
    lm=document.querySelector('#levelmap .levelmeter');
    if(!this.creatinglevel.background){
      levelmap.style.backgroundImage=null;
      lm.style.display=null;
      deletebackgroundbutton.disabled=false;
      return;
    }
    levelmap.style.backgroundImage='url('+this.creatinglevel.background+')';
    lm.style.display='none';
    deletebackgroundbutton.disabled=false;
  },
  deleteBackground:function(){
    deletebackgroundbutton.disabled=true;
    housemap.creatinglevel.background=undefined;
    levelmap.style.backgroundImage=null;
    lm=document.querySelector('#levelmap .levelmeter');
    lm.style.display=null;
  },
  addObjectToMap: function(button){
    this.counter.object++;
    let ob={
      type:button.name,
      id:this.counter.object,
      svg:button.firstElementChild.cloneNode(true),
      innerHTML:button.firstElementChild.innerHTML,
      width:50,
      height:50,
      rotation:0,
      mirror:false,
    }
    ob.innerHTML=ob.innerHTML.replaceAll('\n','')
    ob.innerHTML=ob.innerHTML.replaceAll('\"','\'')
    ob.innerHTML=ob.innerHTML.replaceAll('  ',' ')
    this.finalizeObjectDiv(ob)
    levelobjekte.appendChild(ob.svg);
    this.creatinglevel.objects.push(ob);
    housemap.selectObject(ob.id);
  },
  finalizeObjectDiv: function(ob){
    ob.svg.id='objekt'+ob.id;
    ob.svg.name=ob.id;
    ob.svg.classList.add('objekt');
    // ob.svg.width=ob.width;
    // ob.svg.height=ob.height;
    ob.svg.style.transform='rotate('+ob.rotation+'deg)'
    ob.svg.style.left=ob.x+'px'
    ob.svg.style.top=ob.y+'px'
    dragElement(ob.svg,function(elm){
      //select this object to alter its config
      housemap.selectObject(elm.name);
    },function(elm){
      console.log('object moved',elm);
      ob.x=elm.offsetLeft
      ob.y=elm.offsetTop
    });
    ob.svg.onclick=function(e){
      housemap.selectObject(this.name);
    }
  },
  drawAllObjectsToMap: function(){
    levelobjekte.innerHTML='';
    for (let x=0;x<this.creatinglevel.objects.length;x++){
      let ob=this.creatinglevel.objects[x].svg
      if(this.creatinglevel.objects[x].mirror){
        ob.style.transform='rotate('+ob.rotation+'deg)'+' scale(-1,1)'
      }
      levelobjekte.appendChild(ob);
    }
  },
  mirrorObject: function(){
    let ob=this.getObjectById(selectedObjectConfigId.value);
    if(!ob){
      console.log('ob not found:',ob,selectedObjectConfigId.value)
      return;
    }
    ob.mirror=selectedObjectConfigMirror.checked;
    if(selectedObjectConfigMirror.checked)ob.svg.style.transform+=' scale(-1,1)';
    else ob.svg.style.transform='rotate('+ob.rotation+'deg)';

  },
  getObjectById:function(id){
    let ob;
    for (let x=0;x<this.creatinglevel.objects.length;x++){
      if(this.creatinglevel.objects[x].id==id){
        ob=this.creatinglevel.objects[x];
        ob.positionInArray=x;
        break;
      }
    }
    return ob;
  },
  selectObject:function(id){
    let ob=this.getObjectById(id);
    selectedObjectConfigId.value=id;
    selectedObjectConfigName.innerText=ob.type;
    selectedObjectConfigRotation.value=ob.rotation;
    let old=document.querySelector('.objekt.selected');
    if(old)old.classList.remove('selected');
    // if(old && old.length>0)while(old.length>0)old[0].classList.remove('selected');
    ob.svg.classList.add('selected');
    levelcreator.classList.add('showObjectConfig');
  },
  rotateObjectOnMap:function(){
    let ob=this.getObjectById(selectedObjectConfigId.value);
    ob.rotation=selectedObjectConfigRotation.value;
    ob.svg.style.transform='rotate('+ob.rotation+'deg)';
    if(selectedObjectConfigMirror.checked)ob.svg.style.transform+=' scale(-1,1)';
    console.log(ob.svg.style.transform,ob.rotation);
  },
  removeObjectFromMap:function(){
    let ob=this.getObjectById(selectedObjectConfigId.value);
    if(!ob){console.error('kein object gefunden zum l??schen',selectedObjectConfigId.value);return;}
    ob.svg.parentElement.removeChild(ob.svg);
    this.creatinglevel.objects.splice(ob.positionInArray,1);
    levelcreator.classList.remove('showObjectConfig');
  },
  createLabel:function(){
    this.counter.label++;
    let nl = {
      text:'text',
      x:250,
      y:250,
      id:this.counter.label,
      rotation:0,
      size:4, //0-5
    }
    this.addDivToLabel(nl);
    levellabel.appendChild(nl.div);
    selectedLabelText.value=nl.text;
    this.creatinglevel.labels.push(nl);
    this.selectLabel(nl.id);
  },
  addDivToLabel: function(nl){
    let tdiv=document.createElement('div');
    tdiv.className='label';
    tdiv.innerText=nl.text;
    tdiv.id='text'+nl.id;
    tdiv.name=nl.id;
    tdiv.style.fontSize=this.fontsizes[nl.size];
    tdiv.style.transform='rotate('+nl.rotation+'deg)';
    tdiv.onclick=function(){
      housemap.selectLabel(this.name);
    }
    dragElement(tdiv, null, function(elm){
      let l=housemap.getLabelById(elm.name);
      l.x=elm.offsetLeft;
      l.y=elm.offsetTop;
    })
    nl.div=tdiv;
  },
  drawAllLabelsToMap: function(){
    levellabel.innerHTML='';
    for (let x=0;x<this.creatinglevel.labels.length;x++){
      levellabel.appendChild(this.creatinglevel.labels[x].div);
      this.creatinglevel.labels[x].div.classList.remove('selected');
    }
  },
  getLabelById: function(id){
    let l;
    for (let x=0;x<this.creatinglevel.labels.length;x++){
      if(this.creatinglevel.labels[x].id==id){
        l=this.creatinglevel.labels[x];
        l.positionInArray=x;
        break;
      }
    }
    return l;
  },
  changeLabel: function(){
    let id=selectedLabelText.name;
    let l=this.getLabelById(id);
    l.text=selectedLabelText.value;
    l.div.innerText=l.text;
    if(l.text.length==0)l.div.innerText='???';
  },
  selectLabel: function(id){
    let old=document.querySelector('.label.selected');
    if(old)old.classList.remove('selected');
    let l=housemap.getLabelById(id);
    l.div.classList.add('selected');
    selectedLabelText.name=id;
    selectedLabelText.value=l.text;
    selectedLabelSize.value=l.size;
    levelcreator.classList.add('labelSelected');
  },
  changeLabelSize: function(){
    let id=selectedLabelText.name;
    let l=this.getLabelById(id);
    l.size=selectedLabelSize.value;
    l.div.style.fontSize=this.fontsizes[l.size];
  },
  rotateLabel: function(){
    let id=selectedLabelText.name;
    let l=this.getLabelById(id);
    l.rotation=selectedLabelRotation.value;
    l.div.style.transform='rotate('+l.rotation+'deg)';
  },
  deleteLabel: function(){
    let id=selectedLabelText.name;
    let l=this.getLabelById(id);
    l.div.parentElement.removeChild(l.div);
    this.creatinglevel.labels.splice(l.positionInArray,1);
    levelcreator.className='label';
  },
  uploadFotos: function(){
    for (let x=0;x<fotoupload.files.length;x++){
      let file = fotoupload.files[x];
      // let nombre = backgroundupload.files[0].name;
  		let imageType = /image.*/;
      if (file.type.match(imageType)){
        let reader = new FileReader();
        reader.onload = function(e){
          housemap.pendingfotos.push(
            {
              name:file.name,
              b64:reader.result
            });
          housemap.buildPendingFotos();
        }
        reader.readAsDataURL(file);
      }
    }
  },
  buildPendingFotos:function(){
    pendingfotos.innerHTML='';
    for (let x=0;x<this.pendingfotos.length;x++){
      let b=document.createElement('button');
      let s=document.createElement('span');
      s.innerText=this.pendingfotos[x].name
      b.id='pendingfoto'+x
      b.name=x
      b.onclick=function(){
        housemap.addFotoLink(housemap.pendingfotos[b.name])
        housemap.pendingfotos.splice(b.name,1)
        housemap.buildPendingFotos();
      }
      // let img = new Image();
      // img.src=this.pendingfotos[x].b64;
      b.appendChild(s);
      // b.appendChild(img);
      b.style.backgroundImage='url('+this.pendingfotos[x].b64+')'
      pendingfotos.appendChild(b)
    }
  },
  addFotoLink: function(img){
    this.counter.foto++;
    let nl = {
      b64:img.b64,
      name:img.name,
      id:this.counter.foto,
      x:250,
      y:250,
      rotation:0,
    }
    this.addDivToFotolink(nl)
    this.creatinglevel.fotos.push(nl)
    levelfotos.appendChild(div);
    this.selectFotoLink(nl.id);
  },
  addDivToFotolink: function(nl){
    let div=document.createElement('div')
    // let icon=new Image();
    // icon.src="cam.png"
    // div.appendChild(icon)
    div.innerHTML=document.getElementById('fotolinksvgwrapper').innerHTML;
    div.className="fotolink"
    div.name=nl.id
    div.style.top=nl.y+'px'
    div.style.left=nl.x+'px'
    div.style.transform='rotate('+nl.rotation+'deg)'
    dragElement(div,null,function(elm){
      nl.x=elm.offsetLeft;
      nl.y=elm.offsetTop;
    })
    div.onclick=function(){
      housemap.selectFotoLink(this.name)
    }
    nl.div=div
  },
  getFotoLinkById: function(id){
    let fl;
    for (let x=0;x<this.creatinglevel.fotos.length;x++){
      if(this.creatinglevel.fotos[x].id==id){
        fl=this.creatinglevel.fotos[x]
        fl.positionInArray=x;
        break;
      }
    }
    return fl;
  },
  selectFotoLink:function(id){
    let fl=this.getFotoLinkById(id);
    let old=document.querySelector('.fotolink.selected');
    if(old)old.classList.remove('selected');
    fl.div.classList.add('selected');
    selectedFotoRotation.name=id;
    // levelfotopreview.style.backgroundImage='url('+fl.b64+')'
    levelfotopreview.innerHTML='';
    let fpw=new Image();
    fpw.src=fl.b64
    levelfotopreview.appendChild(fpw);
    fotolevelchange.innerHTML='';
    for (let x=0;x<this.level.length;x++){
      let opt=document.createElement('option');
      opt.value=this.level[x].id;
      opt.innerText=this.level[x].name;
      fotolevelchange.appendChild(opt);
    }
    fotolevelchange.value=this.creatinglevel.id;
    levelcreator.classList.add('foto');
    levelcreator.classList.add('fotoSelected');
    selectedFotoName.innerText=fl.name;
  },
  rotateFoto:function(){
    let fl=this.getFotoLinkById(selectedFotoRotation.name)
    fl.rotation=selectedFotoRotation.value
    fl.div.style.transform='rotate('+fl.rotation+'deg)';
  },
  deleteFoto: function(){
    let fl=this.getFotoLinkById(selectedFotoRotation.name)
    this.creatinglevel.fotos.splice(fl.positionInArray,1);
    fl.div.parentElement.removeChild(fl.div)
  },
  moveFotoToLevel: function(){
    let targetlevel = this.getLevelById(fotolevelchange.value);
    if(!targetlevel || targetlevel==this.creatinglevel)return;
    let fl=this.getFotoLinkById(selectedFotoRotation.name)
    targetlevel.fotos.push(fl);
    this.creatinglevel.fotos.splice(fl.positionInArray,1);
    fl.div.parentElement.removeChild(fl.div)
  },
  getLevelById: function(id){
    let targetlevel;
    for (let x=0;x<this.level.length;x++){
      if(this.level[x].id==id){
        targetlevel=this.level[x];
        targetlevel.positionInArray=x;
        break;
      }
    }
    return targetlevel;
  },
  drawAllFotoLinksToMap: function(){
    levelfotos.innerHTML='';
    for (let x=0;x<this.creatinglevel.fotos.length;x++){
      levelfotos.appendChild(this.creatinglevel.fotos[x].div);
    }
  },
  changeLevel: function(){
    let chooseid=levelchoose.value;
    if(chooseid=='newLevel'){
      this.counter.level++;
      let newLevel={
        paths:[],
        objects:[],
        labels:[],
        fotos:[],
        path:{},
        id:this.counter.level,
        name:'level'+this.counter.level,
      }
      this.level.push(newLevel);
      let opt= document.createElement('option');
      opt.value=newLevel.id;
      opt.innerText=newLevel.name;
      levelchoose.insertBefore(opt,levelchoose.lastElementChild);
      levelchoose.value=newLevel.id;
      chooseid=newLevel.id;
    }
    let targetlevel = this.getLevelById(chooseid);
    if(!targetlevel){
      console.log('targetlevel not found?',chooseid);
      return;
    }
    this.creatinglevel=targetlevel;
    levelchoose.value=targetlevel.id;
    levelcreatoroldname.value=targetlevel.name;
    levelcreatorname.value=targetlevel.name;
    this.rebuildLevel();
  },
  changeLevelName: function(){
    this.creatinglevel.name=levelcreatorname.value;
    for (let x=0;x<levelchoose.children.length;x++){
      if(levelchoose.children[x].value==this.creatinglevel.id){
        levelchoose.children[x].innerText=levelcreatorname.value
        break;
      }
    }
  },
  rebuildLevel: function(){
    levelcreator.className='';
    levelmap.className='';
    this.drawPaths(this.creatinglevel.paths,levelgrundriss);
    this.drawBackground();
    this.drawAllObjectsToMap();
    this.drawPathPoints();
    this.drawAllLabelsToMap();
    this.drawAllFotoLinksToMap();
  },
  drawMap: function(lo){
    const fontsizes=this.fontsizes
    function createElement(type, add){
      let keys=Object.keys(add);
      let specialkeys=['for',]
      let el=document.createElement(type);
      for (let x=0;x<keys.length;x++){
        if(specialkeys.indexOf(keys[x])>-1){
          el.setAttribute(keys[x],add[keys[x]]);
        }else{
          el[keys[x]]=add[keys[x]];
        }

      }
      return el;
    }

    for (let x=0;x<lo.length;x++){
      let level=lo[x];
      let radio=createElement('input',{
        type:'radio',
        id:'levelradio'+x,
        name:'level',
      });
      if(x==0)radio.checked=true
      let radiolabel=createElement('label',{
        for:'levelradio'+x,
        innerText:level.name,
        id:'leveltab'+x
      });
      // radiolabel.setAttribute('for','test');
      let leveldiv=createElement('div',{
        className:'level',
        id:'level'+x,
      })
      map.insertBefore(radio,leveltabs);
      levelwrapper.appendChild(leveldiv);
      leveltabs.appendChild(radiolabel);
      //background to level
      if(level.background)leveldiv.style.backgroundImage='url('+level.background+')';
      //paths
      let pathwrapper=createElement('div',{
        className:'pathwrapper'
      })
      let pathsvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      for(let i=0;i<level.paths.length;i++){
        this.drawPath(level.paths[i],pathsvg);
      }
      pathwrapper.appendChild(pathsvg);
      leveldiv.appendChild(pathwrapper);
      //objects -> objectsvgwrapperdoor
      for(let o=0;o<level.objects.length;o++){
        let obj=createElement('div',{
          className:'object '+level.objects[o].type,
          // innerHTML:objectsvgwrapperdoor.innerHTML,
          innerHTML:level.objects[o].svg.innerHTML,
        })
        obj.style.left=level.objects[o].x+'px'
        obj.style.top=level.objects[o].y+'px'
        obj.style.transform='rotate('+level.objects[o].rotation+'deg)'
        if(level.objects[o].mirror)obj.style.transform+=' scale(-1,1)'
        leveldiv.appendChild(obj);
      }
      //label
      for(let l=0;l<level.labels.length;l++){
        let label=createElement('div',{
          className:'label',
          innerText: level.labels[l].text,
        })
        label.style.left=level.labels[l].x+'px'
        label.style.top=level.labels[l].y+'px'
        label.style.transform='rotate('+level.labels[l].rotation+'deg)'
        label.style.fontSize=fontsizes[level.labels[l].size]
        leveldiv.appendChild(label)
      }
      //fotolinks
      for(let f=0;f<level.fotos.length;f++){
        let foto=createElement('a',{
          className:'fotoview',
          id:'foto'+x+f,
          href:'#map',
          tabIndex:f+10,
        });
        foto.style.backgroundImage='url('+level.fotos[f].b64+')'
        let fotolink = createElement('a',{
          className:'fotolink',
          href:'#foto'+x+f,
          innerHTML:fotolinksvgwrapper.innerHTML,
        })
        fotolink.style.left=level.fotos[f].x+'px'
        fotolink.style.top=level.fotos[f].y+'px'
        fotolink.style.transform='rotate('+level.fotos[f].rotation+'deg)'
        leveldiv.appendChild(fotolink)
        fotowrapper.appendChild(foto)
      }

    }
  },
  createHTMLPage: function(){
    this.drawMap(this.level);
    let styles=cssraw.innerHTML
    let html=`<!DOCTYPE html>
    <html lang="en" dir="ltr">
      <head>
        <meta charset="utf-8">
        <title>housemap viewer</title>
        <style>
        ${styles}
        </style>
      </head>
      <body>
      <div id="map">
      ${map.innerHTML}
      </div>
      </body>
      <script>
      document.body.onhashchange = function(e){
          let old = document.querySelector('.viewIt')
          if(old)old.classList.remove('viewIt');
          let el = document.getElementById(location.hash.substring(1));
          if(el && location.hash!='#map')el.classList.add('viewIt');
      }
      </script>
    </html>
      `
    return html
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
    // if(!elmnt.isAllowedToLeaveParent)elmnt.parentElement.onmouseleave=closeDragElement;
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
    if((top<-10 && top<elmnt.offsetTop)||
      (left<-10 && left<elmnt.offsetLeft)||
      (top>510 && top>elmnt.offsetTop)||
      (left>elmnt.offsetLeft && left>1010-elmnt.offsetWidth)){
      closeDragElement();
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
housemap.init();
