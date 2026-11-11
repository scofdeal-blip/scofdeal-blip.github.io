/* SCOF · ligação à nuvem (Supabase)
 * A chave abaixo é a "publishable": é pública por natureza e só abre o que as regras da base de dados deixam.
 * NUNCA pôr aqui a chave "secret" / "service_role".
 */
(function () {
  "use strict";
  var URL_SCOF = "https://psuazovumrjdghhkwqmp.supabase.co";
  var CHAVE_PUBLICA = "sb_publishable_obKCMenFZy4EkNKpBYfJ1Q_l83EsWmW";

  // ler antes de a biblioteca limpar o endereço: veio do link "recuperar palavra-passe"?
  var veioRecuperar = /type=recovery/.test(location.hash || "");
  if (!window.supabase || typeof window.supabase.createClient !== "function") return;
  var sb = window.supabase.createClient(URL_SCOF, CHAVE_PUBLICA, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: "scof-sessao" }
  });

  // ---------- mensagens de erro em português ----------
  function erroPT(e) {
    var m = String((e && (e.message || e.error_description || e.msg)) || e || "");
    var c = String((e && (e.code || e.error_code)) || "");
    if (/failed to fetch|network|load failed|networkerror/i.test(m)) return "Sem ligação à internet. Tente de novo quando tiver rede.";
    if (/invalid login credentials/i.test(m)) return "Email ou palavra-passe errados.";
    if (/email not confirmed/i.test(m)) return "Ainda não confirmou o email. Abra o email que lhe enviámos e carregue no link.";
    if (/already registered|already been registered|user_already_exists/i.test(m + c)) return "Este email já tem conta. Entre no Caderno com a sua palavra-passe.";
    if (/password should be|weak_password|at least/i.test(m + c)) return "A palavra-passe é fraca. Use pelo menos 8 caracteres, com letras e números.";
    if (/rate limit|too many|over_email_send_rate_limit|429/i.test(m + c)) return "Muitas tentativas seguidas. Espere alguns minutos e tente outra vez.";
    if (/not authorized/i.test(m) && /email/i.test(m)) return "O envio de emails do SCOF ainda está a ser configurado. Fale connosco pelo WhatsApp.";
    if (/invalid.*email|email.*invalid|validation_failed/i.test(m + c)) return "O email não parece válido.";
    if (/jwt|token.*expired|refresh token/i.test(m)) return "A sessão expirou. Entre outra vez.";
    if (c === "42501" || /permission denied|row-level security/i.test(m)) return m && !/permission denied|row-level/i.test(m) ? m : "Sem permissão para esta acção.";
    if (c && /^(22|23|P0)/.test(c)) return m;   // mensagens das nossas regras (já em português)
    return "Ocorreu um erro: " + (m || "desconhecido") + ".";
  }

  function lancar(r) { if (r && r.error) throw r.error; return r ? r.data : null; }

  // ---------- conta ----------
  function criarConta(email, senha, pedido, voltarPara) {
    return sb.auth.signUp({
      email: email, password: senha,
      options: { emailRedirectTo: voltarPara, data: { pedido: pedido } }
    }).then(function (r) {
      if (r.error) throw r.error;
      var u = r.data && r.data.user;
      // Com confirmação de email ligada, um email já registado devolve um utilizador sem identidades.
      if (u && Array.isArray(u.identities) && u.identities.length === 0) {
        var e = new Error("User already registered"); e.code = "user_already_exists"; throw e;
      }
      return { sessao: r.data.session || null, utilizador: u };
    });
  }
  function entrar(email, senha) {
    return sb.auth.signInWithPassword({ email: email, password: senha }).then(function (r) { lancar(r); return r.data.session; });
  }
  function sair() { return sb.auth.signOut().then(function () {}, function () {}); }
  function recuperar(email, voltarPara) { return sb.auth.resetPasswordForEmail(email, { redirectTo: voltarPara }).then(lancar); }
  function novaSenha(senha) { return sb.auth.updateUser({ password: senha }).then(lancar); }
  function sessao() { return sb.auth.getSession().then(function (r) { return (r && r.data && r.data.session) || null; }); }
  function aoMudarConta(cb) { sb.auth.onAuthStateChange(function (ev, s) { cb(ev, s); }); }

  // ---------- empresa ----------
  // Devolve {empresa, papel} da primeira empresa da conta, ou null.
  function minhaEmpresa(uid) {
    return sb.from("membros").select("papel, empresas(*)").eq("user_id", uid).order("criado_em", { ascending: true }).limit(1)
      .then(function (r) {
        var d = lancar(r);
        if (!d || !d.length || !d[0].empresas) return null;
        return { empresa: d[0].empresas, papel: d[0].papel };
      });
  }
  // Na primeira entrada, cria a empresa com o pedido feito na montra.
  // O pedido fica na tabela pedidos_pendentes e não dentro da conta (supabase/06): dentro da conta estragava a sessão.
  function criarEmpresaDoPedido() {
    return sb.rpc("criar_empresa_pendente").then(function (r) {
      var d = lancar(r);
      return d && d.length ? d : null;
    });
  }
  function actualizarPerfil(eid, nome, agenda) {
    return sb.rpc("actualizar_perfil", { p_empresa: eid, p_nome: nome, p_usa_agenda: agenda }).then(lancar);
  }

  // ---------- registos ----------
  function tudo(tabela, eid) {
    var lote = 1000, out = [];
    function pagina(i) {
      return sb.from(tabela).select("*").eq("empresa_id", eid).order("criado_em", { ascending: true }).range(i, i + lote - 1)
        .then(function (r) {
          var d = lancar(r) || [];
          out = out.concat(d);
          return d.length === lote ? pagina(i + lote) : out;
        });
    }
    return pagina(0);
  }
  function puxar(eid) {
    return Promise.all([tudo("movimentos", eid), tudo("agenda", eid),
      sb.from("stock_mensal").select("*").eq("empresa_id", eid).then(lancar)])
      .then(function (r) { return { mov: r[0], ag: r[1], stock: r[2] || [] }; });
  }
  // Inserir é seguro de repetir: se já lá estiver (código 23505), conta como feito.
  function inserir(tabela, linha) {
    return sb.from(tabela).insert(linha).then(function (r) {
      if (r.error && r.error.code !== "23505") throw r.error;
    });
  }
  function actualizar(tabela, eid, idLocal, mudancas) {
    return sb.from(tabela).update(mudancas).eq("empresa_id", eid).eq("id_local", idLocal).then(lancar);
  }
  function gravarStock(eid, mes, ei, ef) {
    return sb.from("stock_mensal").upsert({ empresa_id: eid, mes: mes, ei: ei, ef: ef }, { onConflict: "empresa_id,mes" }).then(lancar);
  }

  window.SCOF_NUVEM = {
    sb: sb, erroPT: erroPT, veioRecuperar: veioRecuperar,
    criarConta: criarConta, entrar: entrar, sair: sair, recuperar: recuperar, novaSenha: novaSenha,
    sessao: sessao, aoMudarConta: aoMudarConta,
    minhaEmpresa: minhaEmpresa, criarEmpresaDoPedido: criarEmpresaDoPedido, actualizarPerfil: actualizarPerfil,
    puxar: puxar, inserir: inserir, actualizar: actualizar, gravarStock: gravarStock
  };
})();
