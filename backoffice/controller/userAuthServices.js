const applyUserRights = (userRights) => {
  let languageExist = Ext.getCmp('formEN');
  if (languageExist) {
    // *****LANGUAGES EDITING ********
    if (userRights.english !== "E") {
      let formEN = Ext.getCmp('formEN').getForm().getFields();
      formEN.each(field => {
        field.setReadOnly(true);
      })
    }

    if (userRights.french !== "E") {
      let formFR = Ext.getCmp('formFR').getForm().getFields();
      formFR.each(field => {
        field.setReadOnly(true);
      })
    }

    if (userRights.german !== "E") {
      let formDE = Ext.getCmp('formDE').getForm().getFields();
      formDE.each(field => {
        field.setReadOnly(true);
      })
    }

    if (userRights.russian !== "E") {
      let formRU = Ext.getCmp('formRU').getForm().getFields();
      formRU.each(field => {
        field.setReadOnly(true);
      })
    }

    if (userRights.spanish !== "E") {
      let formSP = Ext.getCmp('formSP').getForm().getFields();
      formSP.each(field => {
        field.setReadOnly(true);
      })
    }
    // ******** END LANGUAGES EDITTING **********
  }



  if (userRights.pictures !== "E") {
    let assetAdd, assetEdit, addImageBtn;
    addImageBtn = Ext.getCmp('addImageBtn'); // allProducts, allSeries
    assetAdd = Ext.getCmp('addBtn');  // Assets
    assetEdit = Ext.getCmp('editBtn'); // Assets

    if (addImageBtn) {
      addImageBtn.setDisabled(true);
    }

    if (assetAdd !== undefined || assetEdit !== undefined) {
      assetAdd.setDisabled(true);
      assetEdit.setDisabled(true);
    }
  }

  if (userRights.related !== "E") {

  }
}