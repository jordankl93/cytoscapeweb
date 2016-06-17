/*
 This file is part of Cytoscape Web.
 Copyright (c) 2009, The Cytoscape Consortium (www.cytoscape.org)
 
 The Cytoscape Consortium is:
 - Agilent Technologies
 - Institut Pasteur
 - Institute for Systems Biology
 - Memorial Sloan-Kettering Cancer Center
 - National Center for Integrative Biomedical Informatics
 - Unilever
 - University of California San Diego
 - University of California San Francisco
 - University of Toronto
 
 This library is free software; you can redistribute it and/or
 modify it under the terms of the GNU Lesser General Public
 License as published by the Free Software Foundation; either
 version 2.1 of the License, or (at your option) any later version.
 
 This library is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 Lesser General Public License for more details.
 
 You should have received a copy of the GNU Lesser General Public
 License along with this library; if not, write to the Free Software
 Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA
 */
$(function () {    
    /*$("#content").html('\
     <div class="tools">\
     <button id="reapplyLayout">Reapply layout</button>\
     <label for="showNodeLabels">Node Labels</label>\
     <input type="checkbox" id="showNodeLabels"/> \
     <label class="warning"><small>You can use the right-clik context menu to add and remove elements</small></label>\
     </div>\
     <div id="cytoscapeweb" width="*">\
     Cytoscape Web will replace the contents of this div with your graph.\
     </div>\
     ');*/
	
	//VARIÁVEIS JS
	var d1, d2;
    var div_id = "cytoscapeweb";
    var vis;
	
	var leitorTXT = new FileReader();
    leitorTXT.onload = leArquivoArestas;
	
	//FUNÇÕES UTEIS
	//Função que abre um arquivo de networksF
    function carregaArquivoArestas(evt) {
        var file = evt.target.files[0];
        leitorTXT.readAsText(file);
    }
    
    //Função le o arquivo e exibe na tela - antiga função draw
    function leArquivoArestas(evt) {
        var fileArr = evt.target.result;
        var linhas = fileArr.split("\n");
		var j = 0;
		var id = 1;
		
		var data = '<graphml>' +
				   '<key attr.type="string" attr.name="label" for="all" id="label"/>' +
				   '<key attr.type="double" attr.name="weight" for="all" id="weight"/>' +
				   '<graph edgedefault="undirected">';
		
		for(j=0; j<linhas.length; j++){
			var linha = linhas[j];
			var itens = linha.split("\t", -1);
			
			if(itens.length == 3){ //enquanto possui apenas 3 colunas
				for (i = 0; i < itens.length; i++) {
					if (i == 2) {							
						data += '<edge id="'+id+'" source="'+ (id-2) +'" target="'+ (id-1) +'">' +
								'<data key="weight">'+ itens[i] +'</data>' +
								'<data key="label">Edge '+i+'</data>' +
								'</edge>';
						
					}
					else{					
						data += '<node id="'+id+'">' +
								'<data key="weight">'+Math.random()+'</data>' +
								'<data key="label">'+itens[i]+'</data>' +
								'</node>';
					}
					id++;
				}				
			}	
		}
		
		data += '</graph></graphml>';
		
		draw(data);
		
		/*fileArr = fileArr.replace(/\t/g, " x ");

        if (typeof fileArr !== "string") {
            if (window.ActiveXObject) {
                fileArr = fileArr.xml;
            } else {
                fileArr = (new XMLSerializer()).serializeToString(fileArr);
            }
        }

        vis.draw({network: fileArr});*/
    }

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
	
	/*function draw(url) {
     $("input, select").attr("disabled", true);
     
     $.get(url, function(dt) {
     if (typeof dt !== "string") {
     if (window.ActiveXObject) {
     dt = dt.xml;
     } else {
     dt = (new XMLSerializer()).serializeToString(dt);
     }
     }
     
     options.layout = { name: "CompoundSpringEmbedder" };
     options.network = dt;
     options.nodeLabelsVisible = $("#showNodeLabels").is(":checked");
     
     d1 = new Date();
     vis.draw(options);
     });
     }*/
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

    // init and draw
    vis = new org.cytoscapeweb.Visualization(div_id, {swfPath: "swf/CytoscapeWeb", flashInstallerPath: "swf/playerProductInstall"});

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
    $("#fileCytoscapeEdge").change(function (evt) {
        carregaArquivoArestas(evt);
    });

	$("#fileCytoscapeNode").change(function (evt) {
		carregaTXT(evt);
    });	

	// Cria um objeto de modelo de rede
    var network_json = {
        //Aqui adicionamos os atributos e seus tipos
        dataSchema: {
            nodes: [{name: "label", type: "string"},
                {name: "foo", type: "string"}
            ],
            edges: [{name: "label", type: "string"},
                {name: "bar", type: "string"}
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
                size: 30
            },
            edges: {                
                width: {defaultValue: 2, continuousMapper: {attrName: "weight", minValue: -1, maxValue: 20}},
				tooltipText: "${weight}"
            }
        },
        network: network_json,
        // hide pan zoom
        panZoomControlVisible: true
    };

    vis.draw(options);

});