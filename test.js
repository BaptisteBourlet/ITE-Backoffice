const object = {
   FRDesc: 'french',
   FRCat: 'french catalog',
   RUDesc: 'russian',
   DEDesc: 'german',
   ENDesc: 'english',
   ESDesc: 'spanish',
}

const allParams = []
  


for (const [key, value] of Object.entries(object)) {
   let language = key.charAt(0) + key.charAt(1);
   if (language === 'FR') {
      allParams.FR[key] = value;
   }
}

console.log(allParams)


 // {
        //   xtype: "toolbar",
        //   dock: "top",
        //   id: "toptool",
        //   items: [
        //     {
        //       xtype: 'combobox',
        //       id: "category1",
        //       store: firstCatStore,
        //       width: 300,
        //       displayField: 'WorkingTitle',
        //       valueField: 'Id',
        //       forceSelection: false,
        //       editable: false,
        //       typeAhead: true,
        //       mode: 'local',
        //       triggerAction: 'all',
        //       listeners: {
        //         change: () => {
        //           Ext.getCmp('category2').setValue('')
        //           secondCatStore.getProxy().setExtraParam('firstCat', Ext.getCmp('category1').getValue());
        //           secondCatStore.reload()
        //         }
        //       }
        //     },
        //     "-",
        //     {
        //       xtype: 'combobox',
        //       id: "category2",
        //       width: 250,
        //       store: secondCatStore,
        //       displayField: 'WorkingTitle',
        //       valueField: 'Id',
        //       forceSelection: false,
        //       editable: false,
        //       typeAhead: true,
        //       mode: 'local',
        //       triggerAction: 'all',
        //       listeners: {
        //         change: () => {
        //           Ext.getCmp('category3').setValue('')
        //           thirdCatStore.getProxy().setExtraParam('secondCat', Ext.getCmp('category2').getValue());
        //           thirdCatStore.reload()
        //         }
        //       }
        //     },
        //     "-",
        //     {
        //       xtype: 'combobox',
        //       id: "category3",
        //       width: 250,
        //       store: thirdCatStore,
        //       displayField: 'WorkingTitle',
        //       valueField: 'Id',
        //       forceSelection: false,
        //       editable: false,
        //       typeAhead: true,
        //       mode: 'local',
        //       triggerAction: 'all',
        //       handler: function () {

        //       },
        //     },
        //   ],
        // },

