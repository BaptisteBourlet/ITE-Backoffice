 // generic function to enable a field (can be copied and reused in any program without modification or dependencies)
 var enableField = function (field) {
    var getField = Ext.get(field);
    var getCmpField = Ext.getCmp(field);
    getField.dom.style.color = 'black';
    getField.dom.style.opacity = '1';
    getField.dom.style.filter = 'alpha(opacity=100)';
    getField.dom.readOnly = '';
    getCmpField.resumeEvents();
};

// generic function to disable a field (can be copied and reused in any program without modification or dependencies)
var disableField = function (field) {
    var getField = Ext.get(field);
    var getCmpField = Ext.getCmp(field);
    getField.dom.style.color = 'black';
    getField.dom.style.opacity = '.65';
    getField.dom.style.filter = 'alpha(opacity=75)';
    getField.dom.readOnly = 'true';
    getCmpField.suspendEvents();
};
 //function to get company
 var getCompany = function(field) {
    Ext.Ajax.request({
      url: '/kwfoamp/PURC100R.pgm',
      method: 'POST',
      cors: true,
      useDefaultXhrHeader: false,
      params: {
        action: 'getPurcCompany',
        sid: sessionStorage.sid
      },
      success: function (response) {
        // check for errors and display error message
        var check = response.responseText
        if (check) {
          var data = eval('(' + response.responseText + ')')
          if (data.SUCCESS == true) {
            var dataCmp = new Array()
            if (data.MULTIPLECOMP == true) {
              for (var i = 0; i <= data.COMPANYLIST.length - 1; i++) {
                var arrCmp = {}
                arrCmp.ENVOMS = data.COMPANYLIST[i].COMPDESC
                arrCmp.ENVID = data.COMPANYLIST[i].COMPID
                dataCmp.push(arrCmp)
              }
              var compStore = Ext.create('Ext.data.Store', {
                data: dataCmp
              })
              Ext.getCmp(field).setStore(compStore)
            } else {
              if (data.COMPANYLIST.length == 1) {
                var arrCmp = {}
                arrCmp.ENVOMS = data.COMPANYLIST[0].COMPDESC
                arrCmp.ENVID = data.COMPANYLIST[0].COMPID
                dataCmp.push(arrCmp)
                var compStore = Ext.create('Ext.data.Store', {
                  data: dataCmp
                })
                Ext.getCmp(field).setStore(compStore)
                Ext.getCmp(field).setValue(data.COMPANYLIST[0].COMPID)
                disableField(field)
                Ext.getCmp(field).setDisabled(true)
              } else {
                Ext.Msg.alert(
                  LangChoice['ERROR'],
                  LangChoice[
                    'Failed to fetch the company. Please contact your IT-Team.'
                  ]
                )
              }
            }
          } else {
            // display error message
            Ext.getBody().unmask()
            Ext.Msg.alert(
              LangChoice['ERROR'],
              LangChoice[
                'Failed to fetch the company. Please contact your IT-Team.'
              ]
            )
          }
        }
      },
      failure: function (response) {
        Ext.getBody().unmask()
        Ext.Msg.alert(
          LangChoice['ERROR'],
          LangChoice[
            'Failed to fetch the company. Please contact your IT-Team.'
          ]
        )
      }
    })
  }

Ext.define('KWFOAM.view.masterdata.items.overview.ItemsOverviewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.masterdata.items.overview.itemsoverviewcontroller',

   

    onKeypress(field, e) {
        switch (e.getKey()) {
            case (e.ENTER):
                this.onButtonSearch();
                break;
            case (e.ESC):
                this.onButtonReset();
                break;
        }
    },

    onGridDoubleClick(grid, record) {
        let me = this;
        let thisView = this.getView();
        let itemid = record.get('imitemid');
		let imowner = record.get('imowner');
        let modus = this.getViewModel().get('modus');
        let callback = this.getViewModel().get('callback');
        switch(modus) {
            case 'search' : callback(itemid); thisView.up('window').hide(); break;
            default: me.editItem(itemid, imowner); 
        }
        
    },

    onGridButtonDetails(grid, rowIndex, colIndex) {
        let me = this;
        let thisView = this.getView();
        let modus = this.getViewModel().get('modus');
        let callback = this.getViewModel().get('callback');
        let record = grid.getStore().getAt(rowIndex);
        let itemid = record.get('imitemid');
        switch(modus) {
            case 'search' : callback(itemid); thisView.up('window').hide(); break;
            default: me.editItem(itemid); 
        }
    },

    onButtonHideShowSearch(button) {
        let thisView = this.getView();
        thisView.lookupReference('search_area').setHidden(!thisView.lookupReference('search_area').isHidden());
    },

    onButtonRefresh() {
        this.onButtonSearch();
    },

    onButtonSearch(button) {
        this.getView().down('pagingtoolbar').moveFirst();
        let store = this.getView().getViewModel().getStore('ItemsData');
        store.load();
    },

    onButtonReset(button) {
        let form = button.up('form');
        form.reset();
        this.getViewModel().notify();
        this.onButtonSearch();
    },

    onButtonAdd() {

        let itemdetailpanel = Ext.create('KWFOAM.view.masterdata.items.creation.ItemCreation');

        let mainpanel = Ext.ComponentQuery.query('mainpanel')[0];
        mainpanel.add(itemdetailpanel);
        getCompany('itemcompany')
        mainpanel.setActiveItem(itemdetailpanel);
    },

    onButtonClose() {
        let thisView = this.getView();
        thisView.close();
    },

    onItemTypeChange(combo, newValue, oldValue, eOpts) {

        let itemgroup = this.getViewModel().get('search_itemgroup');
        let itemsubgroup = this.getViewModel().get('search_itemsubgroup');

        this.getViewModel().set('search_itemtype', newValue);
        this.getViewModel().set('search_itemgroup', null);
        this.getViewModel().set('search_itemsubgroup', null);

        this.getViewModel().notify();

        this.getViewModel().set('storeItemGroups', {});
        this.getViewModel().set('storeItemSubgroups', {});

        this.getViewModel().getStore('ItemsData').load();

        let storeItemGroups = Ext.create('KWFOAM.store.ItemGroups');
        storeItemGroups.getProxy().setExtraParam('itemtype', newValue);
        storeItemGroups.load();
        this.getViewModel().set('storeItemGroups', storeItemGroups);        

        this.getViewModel().set('search_itemgroup', itemgroup);
        this.getViewModel().set('search_itemsubgroup', itemsubgroup);

    },

    onItemGroupChange(combo, newValue, oldValue, eOpts) {

        let itemtype = this.getViewModel().get('search_itemtype');
        let itemsubgroup = this.getViewModel().get('search_itemsubgroup');

        this.getViewModel().set('search_itemgroup', newValue);
        this.getViewModel().set('storeItemSubgroups', {});

        this.getViewModel().set('search_itemsubgroup', null);

        this.getViewModel().notify();   

        this.getViewModel().getStore('ItemsData').load();             

        let storeItemSubgroups = Ext.create('KWFOAM.store.ItemSubgroups');
        storeItemSubgroups.getProxy().setExtraParam('itemtype', itemtype);
        storeItemSubgroups.getProxy().setExtraParam('itemgroup', newValue);
        storeItemSubgroups.load();
        this.getViewModel().set('storeItemSubgroups', storeItemSubgroups); 

        this.getViewModel().set('search_itemsubgroup', itemsubgroup); 

    }, 
    
    onItemSubgroupChange(combo, newValue, oldValue, eOpts) {

        this.getViewModel().set('search_itemsubgroup', newValue);
        this.getViewModel().notify();   
        this.getViewModel().getStore('ItemsData').load();          

    },

    onCMPfilterChange( checkbox, newValue, oldValue, eOpts) {
        
        this.getViewModel().set('CMPfilter', newValue);
        this.getViewModel().notify();   
        this.getViewModel().getStore('ItemsData').load();          

    },

    onGridShowContextMenu(view, record, item, i, e) {
        let itemid = record.get('imitemid');
		let imowner = record.get('imowner');
        let me = this;
        e.preventDefault();

        let menu = Ext.create('Ext.menu.Menu', {
            items: [
                {
                    text: LangChoice.ItemDetails,
                    iconCls: KWFOAM.singletons.Globals.getIconDetail(),
                    handler: function () { me.editItem(itemid, imowner) },
                },
                '-',
                {
                    text: LangChoice.DeleteItem,
                    iconCls: KWFOAM.singletons.Globals.getIconDelete(),
                    handler: function () { me.deleteItem(itemid) },
                },
                '-',
                {
                    text: LangChoice.copyItem,
                    iconCls: KWFOAM.singletons.Globals.getIconDelete(),
                    handler: function () { me.copyItem(itemid) },
                },
            ]
        });;
        menu.showAt(e.getXY());
    },

    editItem(itemid, imowner) {

		// find in store if item owner = true
	    if (imowner == true) {
	
		CDvts.tab.launchTabByForce(3052, '&itemid=' + itemid, 'Artikel ' + itemid);	
	
        //let itemdetailpanel = Ext.create('KWFOAM.view.masterdata.items.detail.ItemDetail', {
        //    mode: 'update',
        //    itemid: itemid
        //});

        //let mainpanel = Ext.ComponentQuery.query('mainpanel')[0];
        //mainpanel.add(itemdetailpanel);
        //mainpanel.setActiveItem(itemdetailpanel);
		
		} else {
		CDvts.tab.launchTabByForce(3051, '&itemid=' + itemid, 'Artikel ' + itemid);	
		}	
		
    },

    deleteItem(itemid) {
        let me = this;

        Ext.Msg.confirm(LangChoice.CDelete, LangChoice.ConfirmDeleteItem, function (btn, text) {
            if (btn == 'yes') {
                Ext.Ajax.request({
                    url: KWFOAM.singletons.Globals.getBaseUrl(),
                    method: 'GET',
                    params: {
                        sessionid: KWFOAM.singletons.Globals.getSessionId(),
                        program: 'ITEM100R',
                        action: 'deleteitem',
                        itemid: itemid
                    },
                    success: function (response) {
                        let itemObject = Ext.decode(response.responseText);
                        if (itemObject.SUCCESS == true) {
                            me.onButtonRefresh();
                        } else {
                            Ext.Msg.alert(LangChoice['ERROR'], LangChoice.DeletingItemUnsuccessful + itemObject.MSG);
                        }
                    },
                    failure: function (response) {
                        Ext.Msg.alert(LangChoice['ERROR'], LangChoice.WebserviceDeletingItemFailed);
                    }
                });
            }
        })
    },

   copyItem(itemid) {
        let me = this;
                Ext.Ajax.request({
                    url: KWFOAM.singletons.Globals.getBaseUrl(),
                    method: 'GET',
                    params: {
                        sessionid: KWFOAM.singletons.Globals.getSessionId(),
                        program: 'CPYART',
                        action: 'copyitem',
                        oldart: itemid
                    },
                    success: function (response) {
                        let itemObject = Ext.decode(response.responseText);
                        if (itemObject.SUCCESS == true) {
						CDvts.tab.launchTabByForce(3052, '&itemid=' + itemObject.NEWART, 'Artikel ' + itemObject.NEWART);	
						//let itemdetailpanel = Ext.create('KWFOAM.view.masterdata.items.detail.ItemDetail', {
						//	mode: 'update',
						//	itemid: itemObject.NEWART
						//	});
						//	let mainpanel = Ext.ComponentQuery.query('mainpanel')[0];
						//	mainpanel.add(itemdetailpanel);
						//	mainpanel.setActiveItem(itemdetailpanel);
                        } else {
                            Ext.Msg.alert(LangChoice['ERROR'], itemObject.MSG);
                        }
                    },
                    failure: function (response) {
                        Ext.Msg.alert(LangChoice['ERROR']);
                    }
                });
            
   
    }	
	
})    