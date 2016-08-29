$(function () {    

	// Inicia o objeto de visualização
    vis = new org.cytoscapeweb.Visualization(div_id, {swfPath: "swf/CytoscapeWeb", flashInstallerPath: "swf/playerProductInstall"});
    
	//Iniciando os objetos de leitura de arquivo
	leitorNosTXT = new FileReader();
	leitorArestasTXT = new FileReader();
	leitorNosTXT.onload = leArquivoNos;
	leitorArestasTXT.onload = leArquivoArestas;
	
	//FUNÇÕES UTEIS
	//-------------------- Funções para criar nós ------------------------//
	function abrirArquivosNos(){
		var no = document.getElementById("fileCytoscapeNode").files;
		leitorNosTXT.readAsText(no[0]);
	}
	
	function leArquivoNos(evt){
		var fileArr = evt.target.result;
		var linhas = fileArr.split("\n");
		var j = 0;		
		
		var data;
		
		for(j=0; j<linhas.length; j++){
			var linha = linhas[j];
			var itens = linha.split("\t", -1);

			data = { id: itens[0],
						 label: itens[0],
						 color: itens[1],
						 weight: parseFloat(itens[2]) };
			 vis.addNode(240, 360, data, true);			
			
			
		}		
		
	}
	
	//-------------------- Funções para criar arestas ------------------------//	
	function abrirArquivosArestas(){
		var arquivo = document.getElementById("fileCytoscapeEdge").files;
		carregaArquivoArestas(arquivo[0]);
	}
	
	//Função que abre um arquivo de arestas networksF
    function carregaArquivoArestas(arquivo) {
        //var file = evt.target.files[0];
        leitorArestasTXT.readAsText(arquivo);
    }
    
    //Função le o arquivo e exibe na tela - antiga função draw
    function leArquivoArestas(evt) {
        var fileArr = evt.target.result;
        var linhas = fileArr.split("\n");
		var j = 0;
		var id = 1;
				
		var lista = new Array();
		for(j=0; j<linhas.length; j++){
			var linha = linhas[j];
			var itens = linha.split("\t", -1);
					
			if(itens.length == 3){ //enquanto possui apenas 3 colunas
				
				lista.push({ group: "edges", color: "#0B94B1", data: { source: itens[0], target: itens[1], weight: parseInt(itens[2]) }});				
				
			}	
		}
		
		vis.addElements(lista, true);		
    }	
	// ----------------------------------------------------------------------------	

    var _srcId;
    // Função para adicionar nova aresta
    function clickNodeToAddEdge(evt) {
        if (_srcId != null) {
            vis.removeListener("click", "nodes", clickNodeToAddEdge);
            var e = vis.addEdge({source: _srcId, target: evt.target.data.id, }, true);
            _srcId = null;
        }
    }
	
	function showElapsedTime() {
		d2 = new Date();
		var elapsed = (d2.getTime() - d1.getTime()) / 1000;
		$("#elapsedTime").html(elapsed + " seconds");
	}
	
	function createData(nodesNumber, edgesNumber) {
		var data = '<graphml>' +
				   '<key attr.type="string" attr.name="label" for="all" id="label"/>' +
				   '<key attr.type="double" attr.name="weight" for="all" id="weight"/>' +
				   '<graph edgedefault="undirected">';

		var i;
		for (i = 1; i <= nodesNumber; i++) {
			data += '<node id="'+i+'">' +
					//'<data key="weight">'+Math.random()+'</data>' +
					'<data key="label">Node '+i+'</data>' +
					'</node>';
		}
		if (nodesNumber > 1) {
			for (i = 1; i <= edgesNumber; i++) {
				var src = 0, tgt = 0;
				while (src <= 0) {
					src = Math.round(Math.random() * nodesNumber);
				}
				while (tgt <= 0 || tgt === src) {
					tgt = Math.round(Math.random() * nodesNumber);
				}
				
				data += '<edge id="'+i+'" source="'+src+'" target="'+tgt+'">' +
						'<data key="weight">'+Math.random()+'</data>' +
						'<data key="label">Edge '+i+'</data>' +
						'</edge>';
			}
		}
				   
		data += '</graph></graphml>';

		return data;
	}	
	
	function draw(data) {
		$("input, select").attr("disabled", true);

		if (data) {
			var layout = { name: "ForceDirected" };

			if (data.indexOf("</graphml>") === -1 && data.indexOf("</graph>") > -1) { // XGMML...
				layout = { name: "Preset", options: { fitToScreen: true } };
			} else { // GraphML or SIF
				if ($("#layouts").val() !== "Preset") {
					layout = { name: $("#layouts").val(), options: { weightAttr: "weight", restLength: 30, autoStabilize: false } };
				}
			}

			options.layout = layout;
			options.network = data;
			options.nodeLabelsVisible = $("#showNodeLabels").is(":checked");
			options.edgeLabelsVisible = $("#showEdgeLabels").is(":checked");

			d1 = new Date();
			vis.draw(options);
		}
	}
	//FIM FUNÇÕES UTEIS

	//Adiciona menus do botão direito do mouse
    vis.ready(function () {
        //showElapsedTime();

		var layout = vis.layout();
		$("#layouts").val(layout.name);
		$("input, select").attr("disabled", false);
		$("#updateVisualStyle").attr("disabled", false);
		$("#mergeEdges").attr("checked", vis.edgesMerged());
		$("#showNodeLabels").attr("checked", vis.nodeLabelsVisible());
		$("#showEdgeLabels").attr("checked", vis.edgeLabelsVisible());

        vis.addContextMenuItem("Deletar nó", "nodes", function (evt) {
            vis.removeNode(evt.target.data.id, true);
        })
		.addContextMenuItem("Deletar aresta", "edges", function (evt) {
			vis.removeEdge(evt.target.data.id, true);
		})
		.addContextMenuItem("Adicionar novo nó", function (evt) {
			var x = evt.mouseX;
			var y = evt.mouseY;
			var parentId;
			if (evt.target != null && evt.target.group == "nodes") {
				parentId = evt.target.data.id;
				x = evt.target.x;
				y = evt.target.y;
				x += Math.random() * (evt.target.width / 3) * (Math.round(Math.random() * 100) % 2 == 0 ? 1 : -1);
				y += Math.random() * (evt.target.height / 3) * (Math.round(Math.random() * 100) % 2 == 0 ? 1 : -1);
			}
			var n = vis.addNode(x, y, {parent: parentId}, true);
			n.data.label = n.data.id;
			vis.updateData([n]);
		})
		.addContextMenuItem("Adicionar nova aresta (Clique sobre o nó alvo)", "nodes", function (evt) {
			_srcId = evt.target.data.id;
			vis.removeListener("click", "nodes", clickNodeToAddEdge);
			vis.addListener("click", "nodes", clickNodeToAddEdge);
		})
		.addContextMenuItem("Deletar selecionados", function (evt) { //Deleta Nós e arestas selecionados
			var items = vis.selected();
			if (items.length > 0) {
				vis.removeElements(items, true);
			}
		});
    });

    vis.addListener("layout", function(evt) {
		showElapsedTime();
	})
	.addListener("dblclick", function(evt) {
		vis.addNode(evt.mouseX, evt.mouseY, { weight: Math.random() }, true);
	})
	.addListener("error", function(err) {
		alert(err.value.msg);
	});
	
	// Register control liteners:
	$("#layouts").change(function(evt) {
		d1 = new Date();
		vis.layout($("#layouts").val());
	});
    $("#showNodeLabels").change(function (evt) {
        vis.nodeLabelsVisible($("#showNodeLabels").is(":checked"));
    });
	$("#showEdgeLabels").change(function(evt) {
		vis.edgeLabelsVisible($("#showEdgeLabels").is(":checked"));
	});
    $("#reapplyLayout").click(function (evt) {
        var layout = vis.layout();
        vis.layout(layout);
    });	
	$("#createGraph").click(function(evt) {
		var data = createData($("#nodesNumber").val(), $("#edgesNumber").val());
		draw(data);
	});
	$("#minNodeWeight, #minEdgeWeight").keydown(function(evt) {
		if (evt.which === 13) {
		   var val = parseFloat($(this).val());
		   var reapplyMappers = $("#reapplyMappers").is(":checked");
		   val = isNaN(val) ? 0 : val;
		   var gr = $(this).attr("id") === "minNodeWeight" ? "nodes" : "edges";
		   vis.filter(gr, function(item) {
				return item.data.weight >= val;
		   }, reapplyMappers);
		   // Enable the update button when the filter did not update the view:
		   $("#updateVisualStyle").attr("disabled", reapplyMappers);
		}
	});
	$("#updateVisualStyle").click(function(evt) {
		vis.visualStyle(options.visualStyle);
	});
	$("#toXGMML").click(function(evt) {
		alert(vis.xgmml());
	});
	$("#toGraphML").click(function(evt) {
		alert(vis.graphml());
	});
	$("#toSIF").click(function(evt) {
		alert(vis.sif());
	});
    
    /*Quando um arquivo de arestas é chamado*/
    /*$("#fileCytoscapeEdge").change(function (evt) {
        carregaArquivoArestas(evt);
    });*/
	$("#abrirArquivosArestas").click(function (evt) {
        abrirArquivosArestas();
    });

	/*$("#fileCytoscapeNode").change(function (evt) {
		carregaTXT(evt);
    });*/
	$("#abrirArquivosNos").click(function (evt) {
        abrirArquivosNos();
    });

	// Cria um objeto de modelo de rede
    var network_json = {
        //Aqui adicionamos os atributos e seus tipos
        dataSchema: {
            nodes: [{name: "label", type: "string"},
                {name: "foo", type: "string"},
				{name: "color", type: "string"}, //Não funciona
				{name: "weight", type: "number"}
            ],
            edges: [{name: "label", type: "string"},
                {name: "bar", type: "string"},
				{name: "weight", type: "number"}
            ]
        },
        //Aqui criamos os objetos
        data: {
            nodes: [{id: "1", label: "1", foo: "Is this the real life?"},
                {id: "2", label: "2", foo: "Is this just fantasy?"}
            ],
            edges: [{id: "2to1", target: "1", source: "2", label: "2 to 1", bar: "Caught in a landslide..."}
            ]
        }
    };
	
    // options used for Cytoscape Web
    var options = {
        nodeTooltipsEnabled: true,
        edgeTooltipsEnabled: true,
        edgesMerged: false,		
        visualStyle: {
            global: {
                backgroundColor: "#fefefe",
                tooltipDelay: 1000
            },
            nodes: {
				size: { defaultValue: 12, continuousMapper: { attrName: "weight", minValue: 12, maxValue: 36 } },
				color: {
					discreteMapper: {
						attrName: "id",
						entries: [
							{ attrValue: 1, value: "#0B94B1" },
							{ attrValue: 2, value: "#9A0B0B" },
							{ attrValue: 3, value: "#dddd00" }
						]
					}
				}
            },
            edges: {                
                width: {defaultValue: 2, continuousMapper: {attrName: "weight", minValue: -1, maxValue: 20}},
				color: "333333",
				tooltipText: "${weight}"
            }
        },
        network: network_json,
        // hide pan zoom
        panZoomControlVisible: true
    };

    vis.draw(options);

});