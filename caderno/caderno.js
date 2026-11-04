// Caderno SCOF - código da página (separado do caderno_scof.html)
// O construir_site.py publica este ficheiro como caderno/caderno.js

(function(){
  var CHAVE="caderno-scof-v1";
  var N=window.SCOF_NUVEM||null,conta=null;
  var RAMOS=[["Mercearia, loja ou banca de mercado","com",0],["Grossista ou distribuidor","com",0],["Salão, barbearia ou estética","ser",1],
    ["Oficina (auto, motas, electrónica)","ser",1],["Alfaiataria, costura ou calçado","ser",1],["Restaurante, barraca de comida ou take-away","res",1],
    ["Alojamento, hotelaria ou turismo","res",1],["Machamba, criação de animais ou pesca","agr",0],["Moagem e agro-processamento","agr",0],
    ["Construção, serralharia ou carpintaria","con",1],["Transporte (chapa, txopela, mota-táxi, carga)","tra",0],["Explicações, escolinha ou formação","ser",1],
    ["Clínica, consultório ou farmácia","ser",1],["Papelaria, cópias e serviços digitais","ser",0],["Indústria ou fábrica","ind",0],["Outro","out",0]];
  var CATS={venda:["Produtos","Serviços","Encomendas","Revenda a outros comerciantes","Outras vendas"],
    despesa:["Compras de mercadoria","Matéria-prima","Renda","Energia (EDM/Credelec) e água","Combustível e transporte","Salários e ajudantes","INSS",
      "Comunicações e internet","Impostos (ISPC, IVA, IRPS)","Taxas municipais e licenças","Comissões M-Pesa, e-Mola e banco","Manutenção e reparações",
      "Embalagens","Publicidade","Seguros","Juros de empréstimo","Outras despesas",
      "Levantamento do dono (uso pessoal)","Xitique / poupança","Pagamento de empréstimo (capital)","Compra de equipamento"],
    fiado:["Produtos","Serviços","Encomendas"]};
  // saídas de dinheiro que NÃO são custo do mês (vão para casa, poupança, dívida ou património)
  var NAO_CUSTO=["Levantamento do dono (uso pessoal)","Xitique / poupança","Pagamento de empréstimo (capital)","Compra de equipamento"];
  var PAG=["Dinheiro","M-Pesa","e-Mola","mKesh","POS / cartão","Transferência bancária","Cheque","Troca de produtos"];
  function hojeISO(){var d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
  function addDias(iso,n){var d=new Date(iso+"T12:00:00");d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)}
  function mzn(v){var s=(Math.round(v*100)/100).toFixed(2).split(".");return s[0].replace(/\B(?=(\d{3})+(?!\d))/g," ")+","+s[1]+" MZN"}
  function curto(v){var n=Math.round(v),neg=n<0;return(neg?"-":"")+String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g," ")}
  function dataPT(iso){var d=new Date(iso+"T12:00:00");return d.toLocaleDateString("pt-PT",{weekday:"long",day:"numeric",month:"long"})}
  function el(t,c,txt){var e=document.createElement(t);if(c)e.className=c;if(txt!=null)e.textContent=txt;return e}
  function id(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
  function limpo(s,n){return String(s||"").replace(/[;\n\r\t]/g," ").trim().slice(0,n)}
  var HOJE=hojeISO(),MES=HOJE.slice(0,7);

  function exemplos(){
    var h=HOJE,o=addDias(h,-1),a=addDias(h,-3),b=addDias(h,-8);
    return{mov:[
      {id:id(),data:h,tipo:"venda",valor:1850,desc:"Arroz, óleo e açúcar",cat:"Produtos",pag:"M-Pesa",fact:true,nfact:"FR 0041",ex:true},
      {id:id(),data:h,tipo:"venda",valor:640,desc:"Refrescos e pão",cat:"Produtos",pag:"Dinheiro",ex:true},
      {id:id(),data:h,tipo:"despesa",valor:350,desc:"Chapa para o grossista",cat:"Combustível e transporte",pag:"Dinheiro",ex:true},
      {id:id(),data:o,tipo:"fiado",valor:1200,desc:"Cesta do mês",cat:"Produtos",pag:"Por receber",cliente:"Dona Luísa",pago:false,ex:true},
      {id:id(),data:o,tipo:"venda",valor:2300,desc:"Vendas do dia",cat:"Produtos",pag:"Dinheiro",ex:true},
      {id:id(),data:o,tipo:"despesa",valor:1500,desc:"Para casa",cat:"Levantamento do dono (uso pessoal)",pag:"Dinheiro",ex:true},
      {id:id(),data:a,tipo:"despesa",valor:9800,desc:"Reposição de mercadoria",cat:"Compras de mercadoria",pag:"Por pagar (fornecedor)",fornecedor:"Grossista Central",pago:false,fact:true,ex:true},
      {id:id(),data:a,tipo:"fiado",valor:750,desc:"Carvão e velas",cat:"Produtos",pag:"Por receber",cliente:"Sr. Matsinhe",pago:true,dataPago:o,ex:true},
      {id:id(),data:b,tipo:"despesa",valor:4500,desc:"Renda da banca",cat:"Renda",pag:"M-Pesa",ex:true},
      {id:id(),data:b,tipo:"venda",valor:5200,desc:"Vendas do fim-de-semana",cat:"Produtos",pag:"e-Mola",ex:true}],
    ag:[
      {id:id(),data:h,hora:"10:00",cliente:"Ana",tel:"",serv:"Tranças",valor:800,estado:"marcado",ex:true},
      {id:id(),data:h,hora:"14:30",cliente:"Celina",tel:"",serv:"Manicure",valor:350,estado:"marcado",ex:true},
      {id:id(),data:o,hora:"11:00",cliente:"Rosa",tel:"",serv:"Tranças",valor:800,estado:"feito",ex:true},
      {id:id(),data:a,hora:"09:00",cliente:"Joana",tel:"",serv:"Corte",valor:250,estado:"faltou",ex:true}]};
  }

  function prepararDados(d){
    if(!d||!Array.isArray(d.mov))d={mov:[],ag:[]};
    d.ag=d.ag||[];d.stock=d.stock||{};d.log=d.log||[];d.pend=d.pend||[];d.recusados=d.recusados||[];
    d.mov.forEach(function(m){if(m.pag==="Fiado"||m.pag==="A crédito")m.pag="Por receber";if(m.cat==="Transporte")m.cat="Combustível e transporte"});
    return d;
  }
  var dados=prepararDados(null);

  // ---------- PIN e cifragem ----------
  // O PIN nunca é guardado. Dele deriva-se uma chave (PBKDF2, 250 000 voltas) que cifra os dados com AES-GCM.
  // PIN errado = a decifragem falha. Sem o PIN, os dados no aparelho são ilegíveis.
  var ITER=250000,CHAVE_T=CHAVE+"-tentativas",chave=null,sal=null,fila=Promise.resolve(),soTeste=false,modoPin="entrar";
  var temCripto=!!(window.crypto&&crypto.subtle&&window.TextEncoder);
  function b64(u){var s="";for(var i=0;i<u.length;i++)s+=String.fromCharCode(u[i]);return btoa(s)}
  function deB64(s){var b=atob(s),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u}
  function derivar(pin,s,it){return crypto.subtle.importKey("raw",new TextEncoder().encode(pin),"PBKDF2",false,["deriveKey"]).then(function(k){
    return crypto.subtle.deriveKey({name:"PBKDF2",salt:s,iterations:it||ITER,hash:"SHA-256"},k,{name:"AES-GCM",length:256},false,["encrypt","decrypt"])})}
  function lerGuardado(){try{return JSON.parse(localStorage.getItem(CHAVE)||"null")}catch(e){return null}}
  function decifrar(pin,r){return derivar(pin,deB64(r.sal),r.iter).then(function(k){
    return crypto.subtle.decrypt({name:"AES-GCM",iv:deB64(r.iv)},k,deB64(r.ct)).then(function(pt){return{chave:k,dados:JSON.parse(new TextDecoder().decode(pt))}})})}
  function cifrar(){
    if(!chave||soTeste)return Promise.resolve();
    var iv=crypto.getRandomValues(new Uint8Array(12));
    return crypto.subtle.encrypt({name:"AES-GCM",iv:iv},chave,new TextEncoder().encode(JSON.stringify(dados))).then(function(ct){
      localStorage.setItem(CHAVE,JSON.stringify({v:2,sal:b64(sal),iter:ITER,iv:b64(iv),ct:b64(new Uint8Array(ct))}))});
  }
  function guardar(){fila=fila.then(cifrar).catch(function(){var a=document.getElementById("pin-erro");a.textContent="Não foi possível guardar neste aparelho.";a.hidden=false});return fila}
  function pinFraco(p){return /^(\d)\1+$/.test(p)||/^(\d\d)\1\1$/.test(p)||/^(\d{3})\1$/.test(p)||"01234567890".indexOf(p)>=0||"09876543210".indexOf(p)>=0}
  function tentativas(){try{return JSON.parse(localStorage.getItem(CHAVE_T)||"null")||{n:0,ate:0}}catch(e){return{n:0,ate:0}}}
  function gravarTent(t){try{localStorage.setItem(CHAVE_T,JSON.stringify(t))}catch(e){}}
  var relogio=null;
  function erroPin(t){var e=document.getElementById("pin-erro");e.textContent=t;e.hidden=!t}
  function esperaRestante(){var t=tentativas(),s=Math.ceil((t.ate-Date.now())/1000);return s>0?s:0}
  function contarEspera(){
    clearInterval(relogio);var ok=document.getElementById("pin-ok");
    function tique(){var s=esperaRestante();ok.disabled=s>0;
      if(s>0)erroPin("Muitas tentativas erradas. Espere "+(s>=60?Math.ceil(s/60)+" min":s+" s")+" e tente outra vez.");
      else{clearInterval(relogio);if(ok.disabled===false&&document.getElementById("pin-erro").textContent.indexOf("Espere")>=0)erroPin("")}}
    tique();relogio=setInterval(tique,1000);
  }
  function mostrarPin(modo,nota){
    modoPin=modo;esconderNuvem();document.getElementById("boas").hidden=true;document.getElementById("app").hidden=true;
    document.getElementById("pin").hidden=false;document.getElementById("trancar").hidden=true;
    ["pin-0","pin-1","pin-2"].forEach(function(x){document.getElementById(x).value=""});
    var criar=modo!=="entrar",temEx=dados.mov.some(function(m){return m.ex});
    document.getElementById("pin-titulo").textContent=modo==="entrar"?"Entrar no caderno":modo==="mudar"?"Mudar o PIN":"Crie o seu PIN";
    document.getElementById("pin-nota").textContent=nota||(criar?"Escolha 6 números. O PIN tranca o caderno neste aparelho. Não o diga a ninguém: nem o SCOF o conhece, por isso não o conseguimos recuperar.":"Escreva o seu PIN para abrir o caderno.");
    document.getElementById("pin-1-txt").textContent=modo==="mudar"?"PIN novo":"PIN";
    document.getElementById("pin-0-l").hidden=modo!=="mudar";document.getElementById("pin-2-l").hidden=!criar;
    document.getElementById("pin-ok").textContent=modo==="entrar"?"Entrar":"Guardar PIN";
    document.getElementById("pin-saltar").hidden=!(modo==="criar"&&temEx&&!lerGuardado());
    document.getElementById("pin-cancelar").hidden=modo!=="mudar"&&!(modo==="criar"&&soTeste);
    document.getElementById("pin-esqueci").hidden=modo!=="entrar";document.getElementById("esqueci-caixa").hidden=true;
    erroPin(temCripto?"":"Este navegador não permite guardar o caderno com segurança. Abra-o num navegador actualizado (Chrome, Edge, Safari ou Firefox).");
    document.getElementById("pin-ok").disabled=!temCripto;
    if(modo==="entrar")contarEspera();
    document.getElementById(modo==="mudar"?"pin-0":"pin-1").focus();
  }
  document.getElementById("pin").addEventListener("submit",function(e){
    e.preventDefault();if(!temCripto)return;
    var p0=document.getElementById("pin-0").value.trim(),p1=document.getElementById("pin-1").value.trim(),p2=document.getElementById("pin-2").value.trim(),ok=document.getElementById("pin-ok");
    if(modoPin==="entrar"){
      if(esperaRestante()>0)return;
      if(!/^\d{6}$/.test(p1)){erroPin("O PIN tem 6 números.");return}
      ok.disabled=true;erroPin("A abrir...");
      decifrar(p1,lerGuardado()).then(function(r){
        chave=r.chave;sal=deB64(lerGuardado().sal);dados=prepararDados(r.dados);gravarTent({n:0,ate:0});erroPin("");ok.disabled=false;
        if(lerGuardado().iter!==ITER)guardar();
        iniciar();
      }).catch(function(){
        var t=tentativas();t.n++;if(t.n>=5)t.ate=Date.now()+Math.min(3600,30*Math.pow(2,t.n-5))*1000;gravarTent(t);ok.disabled=false;
        erroPin("PIN errado."+(t.n<5?" Restam "+(5-t.n)+" tentativa(s) antes de uma espera.":""));if(t.n>=5)contarEspera();
        document.getElementById("pin-1").value="";document.getElementById("pin-1").focus();
      });
      return;
    }
    if(!/^\d{6}$/.test(p1)){erroPin("O PIN tem de ter exactamente 6 números.");return}
    if(pinFraco(p1)){erroPin("Esse PIN é fácil de adivinhar (repetido, sequência ou padrão como 121212). Escolha outro.");return}
    if(p1!==p2){erroPin("Os dois PIN não são iguais.");return}
    ok.disabled=true;erroPin("A guardar...");
    var verificar=modoPin==="mudar"?decifrar(p0,lerGuardado()):Promise.resolve();
    verificar.then(function(){
      var novoSal=crypto.getRandomValues(new Uint8Array(16));
      return derivar(p1,novoSal).then(function(k){chave=k;sal=novoSal;soTeste=false;return guardar()});
    }).then(function(){ok.disabled=false;erroPin("");iniciar()})
      .catch(function(){ok.disabled=false;erroPin(modoPin==="mudar"?"O PIN actual está errado.":"Não foi possível guardar neste aparelho.")});
  });
  document.getElementById("pin-saltar").addEventListener("click",function(){soTeste=true;chave=null;iniciar()});
  document.getElementById("pin-cancelar").addEventListener("click",function(){iniciar()});
  ["pin-0","pin-1","pin-2"].forEach(function(x){var c=document.getElementById(x);c.addEventListener("input",function(){var v=c.value.replace(/\D/g,"").slice(0,6);if(v!==c.value)c.value=v})});
  document.getElementById("pin-esqueci").addEventListener("click",function(){document.getElementById("esqueci-caixa").hidden=false});
  document.getElementById("apagar-tudo").addEventListener("click",function(){
    try{localStorage.removeItem(CHAVE);localStorage.removeItem(CHAVE_T)}catch(e){}
    chave=null;sal=null;dados=prepararDados(null);document.getElementById("pin").hidden=true;
    if(N&&conta&&conta.empresa){aplicarPerfilNuvem();mostrarPin("criar","Crie um PIN novo. Os registos já enviados para a sua conta voltam a aparecer.");return}
    mostrarBoas(false);
  });
  function trancar(){fila.then(function(){chave=null;sal=null;dados=prepararDados(null);
    // recarregar apaga da memória e do ecrã tudo o que estava aberto
    try{location.reload()}catch(e){mostrarPin("entrar")}})}
  document.getElementById("trancar").addEventListener("click",trancar);
  document.getElementById("mudar-pin").addEventListener("click",function(){mostrarPin("mudar")});
  document.getElementById("criar-pin-ja").addEventListener("click",function(){mostrarPin("criar","Crie um PIN para guardar o caderno neste aparelho. Os exemplos ficam; pode apagá-los depois.")});
  // tranca sozinho: 10 minutos sem mexer, ou 5 minutos noutra aplicação
  var ultimo=Date.now(),saiu=0;
  ["pointerdown","keydown","touchstart"].forEach(function(ev){document.addEventListener(ev,function(){ultimo=Date.now()},{passive:true})});
  document.addEventListener("visibilitychange",function(){if(document.hidden)saiu=Date.now();else if(chave&&saiu&&Date.now()-saiu>5*60000)trancar()});
  setInterval(function(){if(chave&&Date.now()-ultimo>10*60000)trancar()},30000);
  function activos(){return dados.mov.filter(function(m){return!m.anulado})}

  // ---------- primeira vez ----------
  var selRamo=document.getElementById("p-ramo");
  RAMOS.forEach(function(r,i){var o=el("option",null,r[0]);o.value=i;selRamo.appendChild(o)});
  var NOMES_EX=["Mercearia Boa Esperança","Armazém Nkomati Comercial","Salão Mamana Beleza","Oficina Auto Mabote","Alfaiataria Capulana Chic","Restaurante Sabor a Matapa","Condomínio Xiluva","Machamba Ntsako","Moagem Kanimambo","Serralharia Força Unida","Transportes Tsakane","Centro de Explicações Saber Mais","Farmácia Vida Nova","Reprografia Luz Digital","Fábrica de Blocos Unidade","O nome do seu negócio"];
  function exNome(){var n=NOMES_EX[+selRamo.value]||NOMES_EX[0];document.getElementById("p-nome").placeholder=/^O nome/.test(n)?n:"Ex.: "+n}
  selRamo.addEventListener("change",function(){document.getElementById("pf-agenda").checked=!!RAMOS[selRamo.value][2];exNome()});
  function mostrarBoas(editar){
    esconderNuvem();document.getElementById("boas").hidden=false;document.getElementById("app").hidden=true;document.getElementById("pin").hidden=true;
    selRamo.disabled=!!(N&&conta);
    var p=dados.perfil;if(p){document.getElementById("p-nome").value=p.nome;selRamo.value=p.ramoIdx;document.getElementById("pf-agenda").checked=p.agenda}
    else{selRamo.value=0;document.getElementById("pf-agenda").checked=false}
    document.querySelector('#boas [data-ex="1"]').hidden=!!editar;exNome();
  }
  var exClicado="0";
  document.querySelectorAll("#boas button[type=submit]").forEach(function(b){b.addEventListener("click",function(){exClicado=b.dataset.ex})});
  document.getElementById("boas").addEventListener("submit",function(e){
    e.preventDefault();var nome=limpo(document.getElementById("p-nome").value,50),er=document.getElementById("p-erro");
    if(!nome&&exClicado!=="1"){er.textContent="Escreva o nome do negócio.";er.hidden=false;return}
    if(N&&conta&&conta.empresa){
      var agN=document.getElementById("pf-agenda").checked;
      N.actualizarPerfil(conta.empresa.id,nome,agN).then(function(){conta.empresa.nome=nome;conta.empresa.usa_agenda=agN;guardar();iniciar()})
        .catch(function(x){er.textContent=N.erroPT(x);er.hidden=false});
      return;
    }
    var i=+selRamo.value;
    dados.perfil={nome:nome||"Negócio de exemplo",ramoIdx:i,ramo:RAMOS[i][0],codigo:RAMOS[i][1],agenda:document.getElementById("pf-agenda").checked,criado:dados.perfil?dados.perfil.criado:HOJE};
    if(exClicado==="1"&&!dados.mov.length){var x=exemplos();dados.mov=x.mov;dados.ag=x.ag;dados.perfil.agenda=true}
    if(chave){guardar();iniciar()}else mostrarPin("criar");
  });
  document.getElementById("editar-perfil").addEventListener("click",function(){mostrarBoas(true)});

  // ---------- abas ----------
  var abas=["hoje","agenda","resumo"];
  function abrir(n){abas.forEach(function(a){document.getElementById("t-"+a).setAttribute("aria-selected",String(a===n));document.getElementById("p-"+a).hidden=a!==n});desenhar()}
  abas.forEach(function(a){document.getElementById("t-"+a).addEventListener("click",function(){abrir(a)})});

  // ---------- registo ----------
  var tipo="venda";
  function opcoes(sel,lista){sel.textContent="";lista.forEach(function(c){sel.appendChild(el("option",null,c))})}
  function mudarTipo(t){
    tipo=t;
    document.querySelectorAll(".registar button").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.tipo===t))});
    opcoes(document.getElementById("m-cat"),CATS[t]);
    opcoes(document.getElementById("m-pag"),t==="despesa"?PAG.concat(["Por pagar (fornecedor)"]):PAG);
    document.getElementById("l-cliente").hidden=t!=="fiado";
    document.getElementById("l-pag").hidden=t==="fiado";
    document.getElementById("l-forn").hidden=true;
    document.getElementById("t-fact").textContent=t==="despesa"?"Tenho a factura do fornecedor":"Emiti factura ou recibo";
    document.getElementById("m-gravar").textContent=t==="venda"?"Registar venda":t==="despesa"?"Registar despesa":"Registar venda por receber";
  }
  document.getElementById("m-pag").addEventListener("change",function(){document.getElementById("l-forn").hidden=this.value!=="Por pagar (fornecedor)"});
  document.querySelectorAll(".registar button").forEach(function(b){b.addEventListener("click",function(){mudarTipo(b.dataset.tipo)})});

  document.getElementById("f-mov").addEventListener("submit",function(e){
    e.preventDefault();var er=document.getElementById("m-erro");er.hidden=true;
    var v=parseFloat(document.getElementById("m-valor").value),d=document.getElementById("m-data").value,ds=limpo(document.getElementById("m-desc").value,60);
    var cl=limpo(document.getElementById("m-cliente").value,40),pag=tipo==="fiado"?"Por receber":document.getElementById("m-pag").value,fo=limpo(document.getElementById("m-forn").value,40);
    if(!(v>0)){er.textContent="Escreva um valor maior que zero.";er.hidden=false;return}
    if(!d){er.textContent="Escolha a data.";er.hidden=false;return}
    if(d>HOJE){er.textContent="A data não pode ser no futuro.";er.hidden=false;return}
    if(tipo==="fiado"&&!cl){er.textContent="Escreva o nome do cliente que fica a dever.";er.hidden=false;return}
    if(pag==="Por pagar (fornecedor)"&&!fo){er.textContent="Escreva o nome do fornecedor.";er.hidden=false;return}
    var porPagar=pag==="Por pagar (fornecedor)";
    dados.mov.push({id:id(),data:d,tipo:tipo,valor:v,desc:ds||(tipo==="despesa"?"Despesa":"Venda"),cat:document.getElementById("m-cat").value,pag:pag,
      cliente:tipo==="fiado"?cl:undefined,fornecedor:porPagar?fo:undefined,pago:(tipo==="fiado"||porPagar)?false:undefined,
      fact:document.getElementById("m-fact").checked,nfact:limpo(document.getElementById("m-nfact").value,20),criado:new Date().toISOString()});
    pendente("mov+",dados.mov[dados.mov.length-1].id);
    guardar();["m-valor","m-desc","m-cliente","m-forn","m-nfact"].forEach(function(x){document.getElementById(x).value=""});document.getElementById("m-fact").checked=false;desenhar();
  });

  document.getElementById("f-ag").addEventListener("submit",function(e){
    e.preventDefault();var er=document.getElementById("a-erro");er.hidden=true;
    var c=limpo(document.getElementById("a-cliente").value,40),d=document.getElementById("a-data").value,h=document.getElementById("a-hora").value;
    if(!c||!d||!h){er.textContent="Preencha o dia, a hora e o nome do cliente.";er.hidden=false;return}
    dados.ag.push({id:id(),data:d,hora:h,cliente:c,tel:document.getElementById("a-tel").value.replace(/[^\d+]/g,"").slice(0,16),
      serv:limpo(document.getElementById("a-serv").value,40)||"Serviço",valor:parseFloat(document.getElementById("a-valor").value)||0,estado:"marcado"});
    pendente("ag+",dados.ag[dados.ag.length-1].id);
    guardar();["a-cliente","a-tel","a-serv","a-valor"].forEach(function(x){document.getElementById(x).value=""});desenhar();
  });

  document.getElementById("limpar-ex").addEventListener("click",function(){
    dados.mov=dados.mov.filter(function(m){return!m.ex});dados.ag=dados.ag.filter(function(a){return!a.ex});guardar();desenhar();
  });

  function tres(alvo,itens){var c=document.getElementById(alvo);c.textContent="";itens.forEach(function(i){var d=el("div","num "+(i[2]||""));d.appendChild(el("span",null,i[0]));d.appendChild(el("b",null,i[1]));c.appendChild(d)})}

  // ---------- anular (nada se apaga: fica no registo de alterações) ----------
  function caixaAnular(li,m){
    if(li.querySelector(".anular"))return;
    var box=el("div","anular");box.appendChild(el("b",null,"Porque anula este registo?"));
    var sel=el("select");["Enganei-me no valor ou na data","Registo repetido","Devolução ou venda cancelada","Outro motivo"].forEach(function(o){sel.appendChild(el("option",null,o))});
    sel.setAttribute("aria-label","Motivo");box.appendChild(sel);
    var ac=el("div","acoes"),ok=el("button","btn","Anular"),no=el("button","btn claro","Cancelar");ok.type="button";no.type="button";
    ok.addEventListener("click",function(){m.anulado={data:HOJE,motivo:sel.value};dados.log.push({quando:new Date().toISOString(),acao:"anulado",id:m.id,data:m.data,tipo:m.tipo,valor:m.valor,desc:m.desc,motivo:sel.value});pendente("mov~",m.id);guardar();desenhar()});
    no.addEventListener("click",function(){box.remove()});
    ac.appendChild(ok);ac.appendChild(no);box.appendChild(ac);li.appendChild(box);
  }

  function desenharCaderno(){
    var act=activos(),hoje=act.filter(function(m){return m.data===HOJE});
    var vend=hoje.filter(function(m){return m.tipo==="venda"}).reduce(function(s,m){return s+m.valor},0);
    var desp=hoje.filter(function(m){return m.tipo==="despesa"&&m.pag!=="Por pagar (fornecedor)"}).reduce(function(s,m){return s+m.valor},0);
    var porRec=act.filter(function(m){return m.tipo==="fiado"&&!m.pago}).reduce(function(s,m){return s+m.valor},0);
    tres("tres-hoje",[["Entrou hoje",curto(vend),"bom"],["Saiu hoje",curto(desp),"mau"],["Por receber de clientes",curto(porRec),porRec>0?"mau":""]]);
    var cont=document.getElementById("lista-mov");cont.textContent="";
    var ord=dados.mov.slice().sort(function(a,b){return b.data.localeCompare(a.data)});
    if(!ord.length){cont.appendChild(el("p","vazio","Ainda não há registos. Toque em + Venda e escreva o primeiro valor do dia."));return}
    var dia=null,ul=null;
    ord.slice(0,60).forEach(function(m){
      if(m.data!==dia){dia=m.data;cont.appendChild(el("h3","dia",m.data===HOJE?"Hoje":dataPT(m.data)));ul=el("ul","lista");cont.appendChild(ul)}
      var li=el("li",m.anulado?"riscado":null);
      var naoCusto=m.tipo==="despesa"&&NAO_CUSTO.indexOf(m.cat)>=0;
      li.appendChild(el("span","tag "+m.tipo,m.tipo==="fiado"?(m.pago?"recebido":"por receber"):naoCusto?"saída":m.tipo));
      var d=el("div","desc");d.appendChild(el("b",null,m.desc));
      var quem=m.cliente||m.fornecedor;
      d.appendChild(el("small",null,(quem?quem+" · ":"")+m.cat+(m.tipo!=="fiado"?" · "+m.pag:"")));li.appendChild(d);
      li.appendChild(el("span","valor "+(m.tipo==="despesa"?"mau":m.tipo==="venda"?"bom":""),(m.tipo==="despesa"?"− ":"")+mzn(m.valor)));
      var mini=el("div","mini");
      if(m.ex)mini.appendChild(el("span","tag ex","exemplo"));
      if(m.anulado){mini.appendChild(el("span","tag anul","anulado: "+m.anulado.motivo));li.appendChild(mini);ul.appendChild(li);return}
      if(m.fact)mini.appendChild(el("span","tag",m.nfact?"factura "+m.nfact:"com factura"));
      else if(m.tipo!=="despesa")mini.appendChild(el("span","tag semf","sem factura"));
      if(m.pag==="Por pagar (fornecedor)")mini.appendChild(el("span","tag pp",m.pago?"pago ao fornecedor":"por pagar"));
      if(m.pago===false){var bp=el("button",null,m.tipo==="fiado"?"Recebi":"Paguei");bp.type="button";bp.addEventListener("click",function(){m.pago=true;m.dataPago=HOJE;pendente("mov~",m.id);guardar();desenhar()});mini.appendChild(bp)}
      var bx=el("button",null,"Anular");bx.type="button";bx.addEventListener("click",function(){caixaAnular(li,m)});
      mini.appendChild(bx);li.appendChild(mini);ul.appendChild(li);
    });
  }

  function desenharAgenda(){
    var cont=document.getElementById("lista-ag");cont.textContent="";
    var ord=dados.ag.filter(function(a){return a.estado!=="cancelado"}).sort(function(a,b){return(a.data+a.hora).localeCompare(b.data+b.hora)});
    var futuras=ord.filter(function(a){return a.data>=HOJE}),passadas=ord.filter(function(a){return a.data<HOJE}).reverse();
    if(!ord.length){cont.appendChild(el("p","vazio","Sem marcações. Escreva o dia, a hora e o cliente acima."));return}
    [["Próximas",futuras],["Anteriores",passadas]].forEach(function(g){
      if(!g[1].length)return;cont.appendChild(el("h3","dia",g[0]));var ul=el("ul","lista");cont.appendChild(ul);
      g[1].forEach(function(a){
        var li=el("li");li.appendChild(el("span","hora",a.hora));
        var d=el("div","desc");d.appendChild(el("b",null,a.cliente+" · "+a.serv));d.appendChild(el("small",null,(a.data===HOJE?"Hoje":dataPT(a.data))+(a.valor?" · "+mzn(a.valor):"")));li.appendChild(d);
        li.appendChild(el("span","estado "+a.estado,a.estado));
        var mini=el("div","mini");if(a.ex)mini.appendChild(el("span","tag ex","exemplo"));
        if(a.estado==="marcado"){
          var bf=el("button",null,"Feito → venda");bf.type="button";
          bf.addEventListener("click",function(){a.estado="feito";pendente("ag~",a.id);if(a.valor>0){dados.mov.push({id:id(),data:a.data>HOJE?HOJE:a.data,tipo:"venda",valor:a.valor,desc:a.serv+" ("+a.cliente+")",cat:"Serviços",pag:"Dinheiro",ex:a.ex,criado:new Date().toISOString()});pendente("mov+",dados.mov[dados.mov.length-1].id)}guardar();desenhar()});
          var bn=el("button",null,"Faltou");bn.type="button";bn.addEventListener("click",function(){a.estado="faltou";pendente("ag~",a.id);guardar();desenhar()});
          mini.appendChild(bf);mini.appendChild(bn);
          if(a.tel&&a.tel.replace(/\D/g,"").length>=9){
            var num=a.tel.replace(/\D/g,"");if(num.length===9)num="258"+num;
            var w=el("a",null,"Lembrar no WhatsApp");w.target="_blank";w.rel="noopener";
            w.href="https://wa.me/"+num+"?text="+encodeURIComponent("Olá "+a.cliente+"! Lembramos a sua marcação ("+a.serv+") "+(a.data===HOJE?"hoje":"no dia "+a.data.split("-").reverse().join("/"))+" às "+a.hora+".");
            mini.appendChild(w);
          }
          var bx=el("button",null,"Desmarcar");bx.type="button";bx.addEventListener("click",function(){if(N&&conta){a.estado="cancelado";pendente("ag~",a.id)}else dados.ag=dados.ag.filter(function(x){return x.id!==a.id});guardar();desenhar()});
          mini.appendChild(bx);
        }
        li.appendChild(mini);ul.appendChild(li);
      });
    });
  }

  function barras(alvo,pares,cor){
    var c=document.getElementById(alvo);c.textContent="";
    if(!pares.length){c.appendChild(el("p","nota","Nada este mês."));return}
    var max=Math.max.apply(null,pares.map(function(p){return p[1]}).concat([1]));
    pares.forEach(function(p){var d=el("div","barra");d.appendChild(el("span",null,p[0]));var tr=el("div","tr"),en=el("div","en");en.style.width=(p[1]/max*100)+"%";en.style.background=p[2]||cor;tr.appendChild(en);d.appendChild(tr);d.appendChild(el("b",null,p[3]||curto(p[1])));c.appendChild(d)});
  }
  function agrupar(lista,chave){var o={};lista.forEach(function(m){o[m[chave]]=(o[m[chave]]||0)+m.valor});return Object.keys(o).map(function(k){return[k,o[k]]}).sort(function(a,b){return b[1]-a[1]})}

  ["s-ei","s-ef"].forEach(function(k){document.getElementById(k).addEventListener("input",function(){
    var st=dados.stock[MES]||{},v=document.getElementById(k).value;st[k==="s-ei"?"ei":"ef"]=v===""?null:Math.max(0,parseFloat(v)||0);
    dados.stock[MES]=st;pendente("stock",MES);guardar();desenharResumo()})});

  // ISPC (Lei 9/2025), venda de bens: escalões do volume anual (resumo RSM, Out. 2026). Confirmar sempre na AT.
  function taxaISPC(anual){return anual<=1000000?0.03:anual<=2500000?0.04:anual<=4000000?0.05:null}
  function proximoPrazoISPC(){var N=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
    var m=new Date(HOJE+"T12:00:00").getMonth();return m%3===0?"este mês ("+N[m]+")":N[(m+3-m%3)%12]}

  var verProvisorio=false;
  document.getElementById("r-ver").addEventListener("click",function(){verProvisorio=true;desenharResumo()});

  function desenharResumo(){
    var act=activos(),mes=act.filter(function(m){return m.data.slice(0,7)===MES});
    var dias={};mes.forEach(function(m){dias[m.data]=1});var nd=Object.keys(dias).length;
    var diaMes=+HOJE.slice(8,10),pronto=nd>=7||(diaMes>=25&&nd>=3);
    document.getElementById("r-bloq").hidden=pronto||verProvisorio;
    document.getElementById("r-conteudo").hidden=!(pronto||verProvisorio);
    document.getElementById("r-prog").style.width=Math.min(100,nd/7*100)+"%";
    document.getElementById("r-dias").textContent=nd+" de 7 dias com registos este mês.";
    if(!(pronto||verProvisorio))return;
    var vend=mes.filter(function(m){return m.tipo==="venda"}),porRec=mes.filter(function(m){return m.tipo==="fiado"});
    var desp=mes.filter(function(m){return m.tipo==="despesa"});
    var custo=desp.filter(function(m){return NAO_CUSTO.indexOf(m.cat)<0}),nao=desp.filter(function(m){return NAO_CUSTO.indexOf(m.cat)>=0});
    var tv=vend.concat(porRec).reduce(function(s,m){return s+m.valor},0);
    var compras=custo.filter(function(m){return m.cat==="Compras de mercadoria"}).reduce(function(s,m){return s+m.valor},0);
    var func=custo.filter(function(m){return m.cat!=="Compras de mercadoria"}).reduce(function(s,m){return s+m.valor},0);
    var tnao=nao.reduce(function(s,m){return s+m.valor},0);
    var levant=nao.filter(function(m){return m.cat==="Levantamento do dono (uso pessoal)"}).reduce(function(s,m){return s+m.valor},0);
    var noMes=function(x){return(x||"").slice(0,7)===MES};
    var entradas=vend.reduce(function(s,m){return s+m.valor},0)+act.filter(function(m){return m.tipo==="fiado"&&m.pago&&noMes(m.dataPago)}).reduce(function(s,m){return s+m.valor},0);
    var saidas=desp.filter(function(m){return m.pag!=="Por pagar (fornecedor)"}).reduce(function(s,m){return s+m.valor},0)+act.filter(function(m){return m.pag==="Por pagar (fornecedor)"&&m.pago&&noMes(m.dataPago)}).reduce(function(s,m){return s+m.valor},0);
    var caixa=entradas-saidas;
    var aberto=act.filter(function(m){return m.tipo==="fiado"&&!m.pago}).reduce(function(s,m){return s+m.valor},0);
    var devo=act.filter(function(m){return m.pag==="Por pagar (fornecedor)"&&!m.pago}).reduce(function(s,m){return s+m.valor},0);
    var st=dados.stock[MES]||{};
    document.getElementById("s-ei").value=st.ei==null?"":st.ei;document.getElementById("s-ef").value=st.ef==null?"":st.ef;
    var temStock=st.ei!=null&&st.ef!=null,cmv=temStock?st.ei+compras-st.ef:null,res=temStock?tv-cmv-func:null;
    if(temStock)tres("tres-mes",[["Vendas (incl. por receber)",curto(tv),"bom"],["Custo das vendas + despesas",curto(cmv+func),"mau"],["Resultado do mês",curto(res),res>=0?"bom":"mau"]]);
    else tres("tres-mes",[["Vendas (incl. por receber)",curto(tv),"bom"],["Dinheiro que saiu",curto(saidas),"mau"],["Saldo de caixa do mês",curto(caixa),caixa>=0?"bom":"mau"]]);
    var agM=dados.ag.filter(function(a){return a.data.slice(0,7)===MES&&a.estado!=="marcado"}),falt=agM.filter(function(a){return a.estado==="faltou"}).length;
    var tom,tit,frase;
    if(temStock&&res<0){tom="mau";tit="O mês está a dar prejuízo";frase="Os custos passam as vendas em "+mzn(-res)+". Veja as maiores despesas abaixo."}
    else if(tv>0&&levant/tv>=0.3){tom="mau";tit="Muito dinheiro do negócio vai para casa";frase=mzn(levant)+" em levantamentos do dono, "+Math.round(levant/tv*100)+"% das vendas. Combine um valor fixo por mês para si."}
    else if(!temStock&&caixa<0&&compras>0){tom="";tit="Saiu mais dinheiro do que entrou";frase="Pode ser só reposição de stock ("+mzn(compras)+" em compras). Escreva a contagem do stock acima para saber se houve lucro ou prejuízo."}
    else if(!temStock&&caixa<0){tom="mau";tit="Saiu mais dinheiro do que entrou";frase="As saídas passam as entradas em "+mzn(-caixa)+"."}
    else if(tv>0&&aberto/tv>=0.2){tom="mau";tit="Muito dinheiro por receber de clientes";frase=mzn(aberto)+" em vendas ainda por receber, "+Math.round(aberto/tv*100)+"% das vendas do mês."}
    else if(agM.length>=3&&falt/agM.length>=0.2){tom="";tit="Clientes a faltar às marcações";frase=Math.round(falt/agM.length*100)+"% das marcações falharam. Lembretes no WhatsApp ajudam."}
    else{tom="bom";tit="O mês está equilibrado";frase="Vendas acima dos custos e valores por receber controlados. Continue a registar todos os dias."}
    var m=document.getElementById("manchete");m.textContent="";
    var c=el("div","manchete "+tom);c.appendChild(el("div","rot",verProvisorio&&!pronto?"Provisório · poucos dias":"O mais importante"));c.appendChild(el("h3",null,tit));c.appendChild(el("p",null,frase));m.appendChild(c);
    barras("b-pag",agrupar(vend.concat(porRec),"pag"),"var(--ok)");
    barras("b-cat",agrupar(custo,"cat"),"var(--perda)");
    barras("b-nao",agrupar(nao,"cat"),"var(--azul)");
    document.getElementById("bloco-ag").hidden=!(dados.perfil&&dados.perfil.agenda);
    var feitos=dados.ag.filter(function(a){return a.data.slice(0,7)===MES&&a.estado==="feito"}).length,marc=dados.ag.filter(function(a){return a.data.slice(0,7)===MES&&a.estado==="marcado"}).length;
    barras("b-ag",[["Feitas",feitos,"var(--ok)",String(feitos)],["Faltaram",falt,"var(--perda)",String(falt)],["Por fazer",marc,"var(--amarelo)",String(marc)]]);
    // obrigações e sinais
    var semF=vend.concat(porRec).filter(function(x){return!x.fact}).length,anul=dados.log.filter(function(l){return(l.quando||"").slice(0,7)===MES}).length;
    var anual=tv*12,tx=taxaISPC(anual),ob=document.getElementById("obrig");ob.textContent="";
    ob.appendChild(el("h3",null,"Obrigações e avisos"));
    ob.appendChild(el("p","nota",semF?semF+" venda(s) deste mês sem factura ou recibo. No ISPC, cada venda deve ter factura ou documento equivalente, registada e comunicada à Autoridade Tributária.":"Todas as vendas do mês têm factura ou recibo registado."));
    if(devo>0)ob.appendChild(el("p","nota","Deve "+mzn(devo)+" a fornecedores."));
    if(anul)ob.appendChild(el("p","nota",anul+" registo(s) anulado(s) este mês. Ficam no registo de alterações enviado ao SCOF."));
    ob.appendChild(el("p","nota",tx?"Se a empresa está no ISPC e vende bens: com vendas de cerca de "+mzn(anual)+" por ano, a taxa indicativa é "+(tx*100)+"% do volume de negócios (cerca de "+mzn(tv*3*tx)+" por trimestre a este ritmo). Próxima declaração e pagamento: "+proximoPrazoISPC()+".":"A este ritmo as vendas anuais passam 4 000 000 MT, o limite do ISPC: a empresa deve estar no regime geral."));
    ob.appendChild(el("p","nota","Valores indicativos (Lei 9/2025, resumo RSM de Outubro de 2026). Serviços técnicos e profissões liberais têm taxas próprias. Confirme sempre na AT."));
    // dados para a fábrica
    var L=["tipo;entidade;factura;data_emissao;data_vencimento;valor_total;valor_pago;data_pagamento;moeda"];
    function seg(t){t=limpo(t,40);return/^[=+\-@]/.test(t)?"'"+t:t}
    act.filter(function(x){return x.tipo==="fiado"||x.pag==="Por pagar (fornecedor)"}).forEach(function(x){
      var f=x.tipo==="fiado";
      L.push([f?"cliente":"fornecedor",seg(f?x.cliente:x.fornecedor),(x.nfact?seg(x.nfact):"CAD-"+x.id.slice(-6).toUpperCase()),x.data,addDias(x.data,30),
        x.valor.toFixed(2).replace(".",","),(x.pago?x.valor:0).toFixed(2).replace(".",","),x.pago?(x.dataPago||""):"","MZN"].join(";"));
    });
    document.getElementById("csv").value=L.join("\n");
    document.getElementById("log").value=["quando;accao;data_registo;tipo;valor;descricao;motivo"].concat(dados.log.map(function(l){return[l.quando.slice(0,16).replace("T"," "),l.acao,l.data,l.tipo,String(l.valor).replace(".",","),seg(l.desc),seg(l.motivo)].join(";")})).join("\n");
  }

  document.getElementById("copiar").addEventListener("click",function(){
    var t=document.getElementById("csv").value+"\n\n"+document.getElementById("log").value,b=this;
    try{navigator.clipboard.writeText(t).then(function(){b.textContent="Copiado";setTimeout(function(){b.textContent="Copiar dados"},2000)},function(){document.getElementById("csv").select()})}catch(e){document.getElementById("csv").select()}
  });

  function desenhar(){
    var p=dados.perfil;
    document.getElementById("nome-negocio").textContent=p?p.nome:"Caderno SCOF";
    document.getElementById("sub-negocio").textContent=p?"Caderno SCOF · "+p.ramo:"o caderno do negócio";
    var ag=!!(p&&p.agenda);document.getElementById("t-agenda").hidden=!ag;
    document.getElementById("abas").style.gridTemplateColumns=ag?"repeat(3,1fr)":"repeat(2,1fr)";
    if(!ag&&!document.getElementById("p-agenda").hidden){abrir("hoje");return}
    var temEx=dados.mov.some(function(m){return m.ex})||dados.ag.some(function(a){return a.ex});
    document.getElementById("limpar-ex").hidden=!temEx;
    document.getElementById("aviso-txt").innerHTML=soTeste?"<b>Modo experiência.</b> Nada fica guardado: ao fechar a página, tudo desaparece.":"<b>Protótipo.</b> Os registos marcados \"exemplo\" são inventados. O que escrever fica só neste aparelho, cifrado com o seu PIN.";
    document.getElementById("aviso-exemplo").hidden=!(soTeste||dados.mov.some(function(m){return m.ex})||dados.ag.some(function(a){return a.ex}));
    desenharCaderno();desenharAgenda();desenharResumo();
  }

  function iniciar(){
    esconderNuvem();document.getElementById("boas").hidden=true;document.getElementById("pin").hidden=true;document.getElementById("app").hidden=false;
    if(N&&conta&&conta.empresa)aplicarPerfilNuvem();
    document.getElementById("sair-conta").hidden=!(N&&conta);
    document.getElementById("trancar").hidden=!chave;document.getElementById("mudar-pin").hidden=!chave;
    document.getElementById("criar-pin-ja").hidden=!soTeste;
    document.getElementById("mes-actual").textContent=new Date(HOJE+"T12:00:00").toLocaleDateString("pt-PT",{month:"long",year:"numeric"});
    document.getElementById("hoje-data").textContent=dataPT(HOJE);
    document.getElementById("m-data").value=HOJE;document.getElementById("m-data").max=HOJE;document.getElementById("a-data").value=HOJE;
    document.getElementById("ajuda").open=activos().filter(function(m){return!m.ex}).length<3;
    mudarTipo("venda");desenhar();
    if(N&&conta&&chave)sincronizar();
  }
  // =====================================================================
  // NUVEM: conta de cada empresa (só quando o site tem a ligação SCOF_NUVEM)
  // Os registos ficam cifrados no aparelho com o PIN e são enviados para a conta da empresa.
  // Sem internet, ficam numa fila e seguem sozinhos quando a rede voltar.
  // =====================================================================
  function esconderNuvem(){["conta","espera"].forEach(function(x){var e=document.getElementById(x);if(e)e.hidden=true})}
  function pendente(op,ident){
    if(!N||!conta||soTeste)return;
    if(op==="stock"&&dados.pend.some(function(p){return p.op==="stock"&&p.id===ident}))return;
    dados.pend.push({op:op,id:ident});agendarSinc();
  }
  function usarChave(uid){CHAVE="caderno-scof-n-"+uid;CHAVE_T=CHAVE+"-tentativas"}
  function aplicarPerfilNuvem(){
    var e=conta.empresa,i=-1;
    RAMOS.forEach(function(r,k){if(i<0&&r[0]===e.ramo)i=k});
    if(i<0)RAMOS.forEach(function(r,k){if(i<0&&r[1]===e.ramo_codigo)i=k});
    if(i<0)i=RAMOS.length-1;
    dados.perfil={nome:e.nome,ramoIdx:i,ramo:RAMOS[i][0],codigo:e.ramo_codigo,agenda:!!e.usa_agenda,criado:String(e.criado_em||HOJE).slice(0,10)};
  }

  // ---------- conversões caderno <-> base de dados ----------
  function linhaMov(m,E){return{empresa_id:E,id_local:m.id,data:m.data,tipo:m.tipo==="fiado"?"por_receber":m.tipo,valor:Math.round(m.valor*100)/100,
    descricao:String(m.desc||"Registo").slice(0,120),categoria:String(m.cat||"Outros").slice(0,60),pagamento:String(m.pag||"Dinheiro").slice(0,40),
    com_factura:!!m.fact,n_factura:m.nfact?String(m.nfact).slice(0,30):null,cliente:m.cliente||null,fornecedor:m.fornecedor||null,
    pago:m.pago==null?null:!!m.pago,data_pago:m.pago?(m.dataPago||null):null}}
  function mudancasMov(m){
    if(m.anulado)return{anulado:true,motivo_anulacao:String(m.anulado.motivo||"Outro motivo").slice(0,120)};
    if(m.pago==null)return null;
    return{pago:!!m.pago,data_pago:m.pago?(m.dataPago||HOJE):null};
  }
  function movDeLinha(r){return{id:r.id_local,data:r.data,tipo:r.tipo==="por_receber"?"fiado":r.tipo,valor:+r.valor,desc:r.descricao,cat:r.categoria,pag:r.pagamento,
    fact:!!r.com_factura,nfact:r.n_factura||"",cliente:r.cliente||undefined,fornecedor:r.fornecedor||undefined,pago:r.pago==null?undefined:!!r.pago,
    dataPago:r.data_pago||undefined,criado:r.criado_em,anulado:r.anulado?{data:String(r.anulado_em||"").slice(0,10),motivo:r.motivo_anulacao}:undefined,nuvem:true}}
  function linhaAg(a,E){return{empresa_id:E,id_local:a.id,data:a.data,hora:a.hora,cliente:String(a.cliente).slice(0,60),telefone:a.tel||null,
    servico:String(a.serv||"Serviço").slice(0,40),valor:+a.valor||0,estado:a.estado}}
  function agDeLinha(r){return{id:r.id_local,data:r.data,hora:String(r.hora).slice(0,5),cliente:r.cliente,tel:r.telefone||"",serv:r.servico,valor:+r.valor,estado:r.estado,nuvem:true}}

  function juntar(s){
    var esperam={};dados.pend.forEach(function(p){esperam[p.id]=1});
    function fundir(locais,remotos,conv){
      var porId={},ordem=[];
      locais.forEach(function(x){if(x.ex)return;porId[x.id]=x;ordem.push(x.id)});
      remotos.forEach(function(r){var x=conv(r);if(esperam[x.id]&&porId[x.id])return;if(!porId[x.id])ordem.push(x.id);porId[x.id]=x});
      return ordem.map(function(k){return porId[k]});
    }
    dados.mov=fundir(dados.mov,s.mov,movDeLinha);
    dados.ag=fundir(dados.ag,s.ag,agDeLinha);
    s.stock.forEach(function(r){if(esperam[r.mes])return;dados.stock[r.mes]={ei:r.ei==null?null:+r.ei,ef:r.ef==null?null:+r.ef}});
  }

  // ---------- envio ----------
  var sincAtiva=false,sincTimer=null,ultimaSinc=null,estadoSinc="";
  function agendarSinc(){clearTimeout(sincTimer);sincTimer=setTimeout(sincronizar,600)}
  function semRede(e){return!navigator.onLine||/fetch|network|load failed|internet/i.test(String(e&&e.message||e))}
  function mostrarSinc(estado,e){
    estadoSinc=estado;var s=document.getElementById("sinc");if(!s)return;
    if(!(N&&conta)){s.hidden=true;return}
    s.hidden=false;s.textContent="";var n=dados.pend.length,rec=dados.recusados.length;
    s.className="sinc "+(estado==="ok"&&!n?"ok":estado==="a enviar"?"":"aviso");
    var t=estado==="a enviar"?"A guardar na sua conta...":
      estado==="ok"?(n?n+" registo(s) por enviar.":"✓ Guardado na sua conta SCOF"+(ultimaSinc?" às "+ultimaSinc:"")+"."):
      estado==="offline"?"Sem internet: "+n+" registo(s) por enviar. Seguem sozinhos quando a rede voltar.":
      "Não foi possível guardar na conta: "+N.erroPT(e);
    s.appendChild(document.createTextNode(t));
    if(estado!=="a enviar"){var b=el("button",null,"Tentar agora");b.type="button";b.addEventListener("click",function(){sincronizar()});if(n||estado!=="ok")s.appendChild(b)}
    if(rec){s.appendChild(document.createTextNode(" "+rec+" registo(s) não foram aceites: "+dados.recusados[rec-1].erro))}
  }
  function sincronizar(){
    if(!N||!conta||!conta.empresa||!chave||soTeste)return Promise.resolve();
    if(sincAtiva){agendarSinc();return Promise.resolve()}
    sincAtiva=true;mostrarSinc("a enviar");
    var E=conta.empresa.id;
    function procurar(lista,ident){for(var i=0;i<lista.length;i++)if(lista[i].id===ident)return lista[i];return null}
    function proximo(){
      var p=dados.pend[0];if(!p)return Promise.resolve();
      var t;
      if(p.op==="mov+"||p.op==="mov~"){
        var m=procurar(dados.mov,p.id);
        if(!m||m.ex)t=Promise.resolve();
        else if(p.op==="mov+")t=N.inserir("movimentos",linhaMov(m,E));
        else{var mud=mudancasMov(m);t=mud?N.actualizar("movimentos",E,m.id,mud):Promise.resolve()}
      }else if(p.op==="ag+"||p.op==="ag~"){
        var a=procurar(dados.ag,p.id);
        if(!a||a.ex)t=Promise.resolve();
        else t=p.op==="ag+"?N.inserir("agenda",linhaAg(a,E)):N.actualizar("agenda",E,a.id,{estado:a.estado});
      }else if(p.op==="stock"){
        var st=dados.stock[p.id]||{};t=N.gravarStock(E,p.id,st.ei==null?null:st.ei,st.ef==null?null:st.ef);
      }else t=Promise.resolve();
      return t.then(function(){dados.pend.shift();return proximo()},function(e){
        if(semRede(e))throw e;
        // recusado pelas regras da base de dados: guarda o motivo e segue com os outros
        dados.recusados.push({op:p.op,id:p.id,erro:N.erroPT(e),quando:new Date().toISOString()});dados.pend.shift();return proximo();
      });
    }
    return proximo().then(function(){return N.puxar(E)}).then(function(s){
      juntar(s);ultimaSinc=new Date().toLocaleTimeString("pt-PT",{hour:"2-digit",minute:"2-digit"});
      return guardar();
    }).then(function(){sincAtiva=false;desenhar();mostrarSinc("ok")},function(e){
      sincAtiva=false;guardar();mostrarSinc(semRede(e)?"offline":"erro",e);
    });
  }
  if(N){
    window.addEventListener("online",function(){if(conta&&chave)sincronizar()});
    setInterval(function(){if(conta&&chave&&!sincAtiva&&dados.pend.length)sincronizar()},60000);
  }

  // ---------- ecrãs da conta ----------
  function erroContaPT(e){
    var m=String((e&&(e.message||e.msg))||e||""),c=String((e&&(e.code||e.error_code))||"");
    if(/otp_expired|token has expired or is invalid|invalid.*otp/i.test(m+" "+c))return "O código está errado ou já expirou. Confira o último email do SCOF ou peça um código novo.";
    if(/bad_jwt|malformed/i.test(m+" "+c))return "A ligação à sua conta foi recusada neste aparelho. Saia da conta e tente outra vez; se continuar, fale connosco pelo WhatsApp.";
    if(/same_password|should be different/i.test(m+" "+c))return "A palavra-passe nova tem de ser diferente da antiga.";
    return N.erroPT(e);
  }
  var modoConta="entrar";
  function mostrarConta(modo,nota){
    modoConta=modo;["boas","pin","app","espera"].forEach(function(x){document.getElementById(x).hidden=true});
    document.getElementById("conta").hidden=false;document.getElementById("trancar").hidden=true;
    var tit={entrar:"Entrar no Caderno",recuperar:"Recuperar a palavra-passe",codigo:"Escreva o código do email",nova:"Escolha uma palavra-passe nova"}[modo];
    document.getElementById("conta-titulo").textContent=tit;
    document.getElementById("conta-nota").textContent=nota||(modo==="entrar"?"Use o email e a palavra-passe que criou ao fazer o pedido na montra.":
      modo==="recuperar"?"Escreva o email da sua conta. Enviamos um código de 6 números para escolher uma palavra-passe nova.":
      modo==="codigo"?"Abra o email do SCOF (veja também o spam), escreva o código e escolha a palavra-passe nova: pelo menos 8 caracteres, com letras e números.":
      "Pelo menos 8 caracteres, com letras e números.");
    document.getElementById("c-email-l").hidden=modo==="nova";
    var novaSenha=modo==="nova"||modo==="codigo";
    document.getElementById("c-codigo-l").hidden=modo!=="codigo";
    document.getElementById("c-senha-l").hidden=modo==="recuperar";
    document.getElementById("c-senha2-l").hidden=!novaSenha;
    document.getElementById("c-senha-txt").textContent=novaSenha?"Palavra-passe nova":"Palavra-passe";
    document.getElementById("c-senha").autocomplete=novaSenha?"new-password":"current-password";
    document.getElementById("c-ok").textContent=modo==="entrar"?"Entrar":modo==="recuperar"?"Enviar código":"Guardar palavra-passe";
    document.getElementById("c-esqueci").hidden=modo!=="entrar";document.getElementById("c-voltar").hidden=modo!=="recuperar"&&modo!=="codigo";
    document.getElementById("c-tenho-codigo").hidden=modo!=="recuperar";
    document.getElementById("c-sem-conta").hidden=modo!=="entrar";
    document.getElementById("c-ok").disabled=false;erroConta("");
    ["c-senha","c-senha2","c-codigo"].forEach(function(x){document.getElementById(x).value=""});
  }
  function erroConta(t){var e=document.getElementById("c-erro");e.textContent=t;e.hidden=!t}
  function mostrarEspera(titulo,texto,comBotoes){
    ["boas","pin","app","conta"].forEach(function(x){document.getElementById(x).hidden=true});
    document.getElementById("espera").hidden=false;document.getElementById("trancar").hidden=true;
    document.getElementById("espera-titulo").textContent=titulo;document.getElementById("espera-txt").textContent=texto||"";
    document.getElementById("espera-acoes").hidden=!comBotoes;
  }
  function depoisDeEntrar(u){
    conta={uid:u.id,email:u.email,user:u};
    mostrarEspera("A abrir a sua conta...","",false);
    return N.minhaEmpresa(u.id).then(function(me){
      if(me)return me;
      return N.criarEmpresaDoPedido(u).then(function(r){return r?N.minhaEmpresa(u.id):null});
    }).then(function(me){
      if(!me)return mostrarEspera("Esta conta ainda não tem negócio","Faça o pedido na montra do SCOF com este email ("+u.email+"), ou fale connosco pelo WhatsApp.",true);
      conta.empresa=me.empresa;conta.papel=me.papel;
      if(me.empresa.estado==="pendente")return mostrarEspera("Pedido recebido","O pedido de "+me.empresa.nome+" (código "+me.empresa.codigo+") está registado. O SCOF vai confirmar e activar o seu Caderno; avisamos por email ou WhatsApp. Depois, volte a esta página.",true);
      if(me.empresa.estado==="suspensa")return mostrarEspera("Caderno suspenso","O Caderno de "+me.empresa.nome+" está suspenso. Fale com o SCOF.",true);
      usarChave(u.id);
      var g=lerGuardado();
      if(g&&g.ct)mostrarPin("entrar");
      else{dados=prepararDados(null);aplicarPerfilNuvem();mostrarPin("criar","O seu Caderno está activo. Crie um PIN de 6 números para o trancar neste aparelho.")}
    }).catch(function(e){mostrarEspera("Não foi possível abrir a conta",N.erroPT(e),true)});
  }
  if(N){
    document.getElementById("conta").addEventListener("submit",function(ev){
      ev.preventDefault();var ok=document.getElementById("c-ok");
      var email=document.getElementById("c-email").value.trim(),s1=document.getElementById("c-senha").value,s2=document.getElementById("c-senha2").value;
      if(modoConta!=="nova"&&!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email))return erroConta("Escreva o email da sua conta.");
      if(modoConta==="entrar"&&!s1)return erroConta("Escreva a palavra-passe.");
      var codigo=document.getElementById("c-codigo").value.replace(/\D/g,"");
      if(modoConta==="codigo"&&!/^\d{6,10}$/.test(codigo))return erroConta("Escreva o código de 6 números que recebeu no email.");
      if(modoConta==="nova"||modoConta==="codigo"){
        if(s1.length<8||!/[A-Za-z]/.test(s1)||!/\d/.test(s1))return erroConta("Pelo menos 8 caracteres, com letras e números.");
        if(s1!==s2)return erroConta("As duas palavras-passe não são iguais.");
      }
      ok.disabled=true;erroConta(modoConta==="entrar"?"A entrar...":"Um momento...");
      var accao=modoConta==="entrar"?N.entrar(email,s1).then(function(s){return depoisDeEntrar(s.user)}):
        modoConta==="recuperar"?N.recuperar(email,location.href.split("#")[0]).then(function(){mostrarConta("codigo");document.getElementById("c-email").value=email}):
        modoConta==="codigo"?N.sb.auth.verifyOtp({email:email,token:codigo,type:"recovery"}).then(function(r){
          if(r.error)throw r.error;
          return N.novaSenha(s1).then(function(){return depoisDeEntrar(r.data.user||r.data.session.user)});
        }):
        N.novaSenha(s1).then(function(){return N.sessao()}).then(function(s){return s?depoisDeEntrar(s.user):mostrarConta("entrar","Palavra-passe guardada. Entre com ela.")});
      accao.catch(function(e){ok.disabled=false;erroConta(erroContaPT(e))});
    });
    document.getElementById("c-esqueci").addEventListener("click",function(){mostrarConta("recuperar")});
    document.getElementById("c-voltar").addEventListener("click",function(){mostrarConta("entrar")});
    document.getElementById("c-tenho-codigo").addEventListener("click",function(){var e=document.getElementById("c-email").value;mostrarConta("codigo");document.getElementById("c-email").value=e});
    document.getElementById("c-codigo").addEventListener("input",function(){var c=this,v=c.value.replace(/\D/g,"").slice(0,10);if(v!==c.value)c.value=v});
    document.getElementById("espera-ver").addEventListener("click",function(){N.sessao().then(function(s){s?depoisDeEntrar(s.user):mostrarConta("entrar")})});
    // Sair tem de funcionar sempre, mesmo que a Supabase recuse a sessão (ex.: sessão estragada ou expirada).
    function limparSessaoLocal(){try{Object.keys(localStorage).forEach(function(k){if(k.indexOf("scof-sessao")===0)localStorage.removeItem(k)})}catch(e){}}
    function sairConta(){
      fila.catch(function(){}).then(function(){return N.sair()}).catch(function(){}).then(function(){
        limparSessaoLocal();conta=null;chave=null;dados=prepararDados(null);
        try{location.reload()}catch(e){mostrarConta("entrar")}
      });
    }
    document.getElementById("espera-sair").addEventListener("click",sairConta);
    document.getElementById("sair-conta").addEventListener("click",sairConta);
    document.getElementById("envio-nota").textContent="Os seus registos já seguem sozinhos para a sua conta SCOF. Estes dados servem só se precisar de os copiar.";
    var rodape=document.querySelector("footer .wrap");if(rodape)rodape.textContent="Caderno SCOF · Sistema de Controlo Operacional e Financeiro. Os registos ficam cifrados neste aparelho com o seu PIN e guardados na conta da sua empresa. Registo de gestão do próprio negócio; não substitui a contabilidade organizada nem as obrigações fiscais.";
  }

  // ---------- arranque ----------
  if(N){
    var recuperacao=!!N.veioRecuperar;
    var erroLink=/error_code=|error=/.test(location.hash||"")?decodeURIComponent((location.hash.match(/error_description=([^&]*)/)||[,""])[1].replace(/\+/g," ")):"";
    N.aoMudarConta(function(ev){if(ev==="PASSWORD_RECOVERY")mostrarConta("nova")});
    mostrarEspera("A abrir...","",false);
    N.sessao().then(function(s){
      if(location.hash&&/access_token|type=/.test(location.hash))try{history.replaceState(null,"",location.pathname+location.search)}catch(e){}
      if(erroLink){try{history.replaceState(null,"",location.pathname+location.search)}catch(e){}
        return mostrarConta("recuperar","Este link já foi usado ou expirou. Escreva o seu email e peça um código novo.")}
      if(recuperacao&&s)return mostrarConta("nova");
      if(recuperacao&&!s)return mostrarConta("recuperar","O link não funcionou neste aparelho. Escreva o seu email e peça um código novo.");
      return s?depoisDeEntrar(s.user):mostrarConta("entrar");
    }).catch(function(){mostrarConta("entrar")});
  }else{
    var guardado=lerGuardado();
    if(guardado&&guardado.ct)mostrarPin("entrar");
    else{dados=prepararDados(guardado);
      if(dados.perfil)mostrarPin("criar","O caderno agora tem PIN. Crie o seu para trancar os registos que já tem neste aparelho.");
      else mostrarBoas(false)}
  }
})();
