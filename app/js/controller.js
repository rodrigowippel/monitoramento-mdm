angular.module('monitorApp', []).controller('painelController', function($scope, $http, $interval){

    $scope.servers = [];
    $scope.date = new Date();
    $scope.contador = 0;

    $interval(function(){
      $scope.date = new Date();
    }, 1000);

    var ON = "0";
    var OFF = "1";
    var servers = [
       {
         index : 1,
         nome : '2nd Tier - Ambev',
         url : 'http://186.250.185.137/',
         service : 'WS/Servico.svc/MobileWeb/',
         endPoint : 'ResponseMonitoramento'
       },

       {
         index : 6,
         nome : 'BRF - Secundária',
         url : 'http://186.250.185.132:5300/',
         service : 'WS/Servico.svc/MobileWeb/',
         endPoint : 'ResponseMonitoramento'
       },

       {
         index : 3,
         nome : 'SaaS - Revenda',
         url : 'http://186.250.185.141:5300/',
         service : 'WS/Servico.svc/MobileWeb/',
         endPoint : 'ResponseMonitoramento'
       },

       {
         index : 0,
         nome : '1st Tier - Ambev',
         url : 'http://186.250.186.215/',
         service : 'WS/Servico.svc/MobileWeb/',
         endPoint : 'ResponseMonitoramento'
       },

       {
         index : 5,
         nome : 'MI - Ultragaz',
         url : 'http://186.250.185.109/',
         service : 'WS/Servico.svc/MobileWeb/',
         endPoint : 'ResponseMonitoramento'
       },

      /* {
         index : 4,
         nome : 'CAT - Ambev',
         url : 'http://54.207.19.27/',
         service : 'WS/Servico.svc/MobileWeb/',
         endPoint : 'ResponseMonitoramento'
       },*/

       {
         index : 7,
         nome : 'AS - Ambev',
         url : 'http://186.250.185.139/',
         service : 'WS/Servico.svc/MobileWeb/',
         endPoint : 'ResponseMonitoramento'
       }
    ];

    $scope.refresh = function(){
      angular.forEach(servers, function(server, key){

        var urlFinal = server.url + server.service + server.endPoint;
        var infoserver = {};
        infoserver.id = key;
        infoserver.nome = server.nome;
        infoserver.index = server.index;

        $http.get(urlFinal)
        .success(function(response) {
          var data = $.parseJSON(response).retornoMonitoramento;
          var mensagens = [];

          //Mensagens padrões
          mensagens.push(
            {
              status : ON,
              texto : 'Servidor serviço comunicando com sucesso.'
            },
            {
              status : ON,
              texto : 'Servidor aplicação comunicando com sucesso.'
            },
            {
              status : ON,
              texto : 'Servidor do Banco comunicando com sucesso.'
            }
          );

          //Verificação de serviço ativo -Padrão
          var status, texto;
          if(data.ServicoHBMDM === 'running'){
              status = ON,
              texto = 'Serviço HB.MDM ativo com sucesso.'
          }else{
            status = OFF,
            texto = 'Serviço HB.MDM desativado. Verificação necessária.'
          }

          mensagens.push({
            status : status,
            texto : texto
          });

          //Regras 1st e 2nd Tier
          if(data.TotalArquivosPendentes){
            var status, texto;
            if(data.TotalArquivosPendentes == 0){
                status = ON;
                texto = 'Todos os arquivos estão sendo importados com sucesso.';
            }else{
              status = OFF;
              texto = 'Há ' + data.TotalArquivosPendentes + ' arquivos não importados à ' + data.MaiorTempoPendente + ' minutos. Verificação necessária.';
            }

            mensagens.push({
              status : status,
              texto : texto
            });
          }

          //Regras brf
          if(data.StatusIntegracaoSap != null){
            var status, texto;
            if(data.StatusIntegracaoSap == 1){
              if(data.StatusIntegracaoErrors == 1){
                status = OFF;
                texto = 'Integração do SAP esta sendo executada com erros. Verificação necessária.';
              }else{
                status = ON;
                texto = 'Integração do SAP esta sendo executada com sucesso.';
              }
            }else{
              status = OFF;
              texto = 'Integração do SAP não esta sendo executada. Verificação Necessária.';
            }

            mensagens.push({
              status : status,
              texto : texto
            });
          }

          //Regras Puxada
          if(data.StatusIntegracaoVeltec != null){
            var status, texto;
            if(data.StatusIntegracaoVeltec == 1){
              status = ON;
              texto = 'Integração VELTEC esta sendo executada com sucesso.';
            }else{
              status = OFF;
              texto = 'Integração VELTEC não esta sendo executada. Verificação Necessária.';
            }

            mensagens.push({
              status : status,
              texto : texto
            });
          }

          //Regras Mi e CAT
          if(data.StatusRoteirizador != null){
            var status, texto;
            if(data.StatusRoteirizador == 1){
              status = ON;
              texto = 'Roteirizador esta sendo executado com sucesso.';
            }else{
              status = OFF;
              texto = 'Roteirizador não esta sendo executado. Verificação Necessária.';
            }

            mensagens.push({
              status : status,
              texto : texto
            });
          }

          infoserver.mensagens = mensagens;
          infoserver.status = ON;
          infoserver.urlImagem = "../images/green.png";

          angular.forEach(mensagens, function(ms, key){
              if(ms.status == OFF){
                  infoserver.urlImagem = "../images/red.png";
              }
          });

        }).error(function(){
          console.log("erro");

          infoserver.status = ON;
          infoserver.urlImagem = "../images/red.png";
          infoserver.mensagens = [
            {
              status : OFF,
              texto : 'Servidor serviço não está comunicando. Verificação necessária'
            },
            {
              status : OFF,
              texto : 'Servidor aplicação não está comunicando. Verificação necessária'
            }
          ]
        }).then(function(){
          //console.log(infoserver);
        });

	$scope.servers.push(infoserver);
     });
    }

    $scope.initTimer = function(){
      var max = 60;
      setInterval(function(){
        if($scope.contador < max){
          $scope.contador++;
        }else {
          $scope.servers = [];
          $scope.refresh();
          $scope.contador = 0;
        }
      }, 1000);
    };

    $scope.refresh();
    $scope.initTimer();
});
