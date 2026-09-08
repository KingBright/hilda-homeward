/** Keep the last validated snapshot. A corrupt primary never poisons its backup. */
Homeward.define('engine/storage', [], () => {
  class SaveStore {
    constructor(storage,validate,key='hilda-echoes-homeward-v3') {
      this.storage=storage;this.validate=validate;this.key=key;
      this.backup=key+'-backup';this.lastGood=null;this.recovered=false;
    }
    load() {
      for (const key of [this.key,this.backup,'hilda-echoes-homeward-v2','hilda-echoes-homeward-v2-backup']) {
        try {
          const raw=this.storage.getItem(key); if(!raw) continue;
          const value=this.validate(JSON.parse(raw));
          this.lastGood=JSON.stringify(value);this.recovered=key!==this.key;
          return value;
        } catch { /* Try the next independently validated copy. */ }
      }
      return null;
    }
    save(state) {
      const value=JSON.stringify(this.validate(state));
      if(this.lastGood) this.storage.setItem(this.backup,this.lastGood);
      this.storage.setItem(this.key,value);
      this.lastGood=value;
    }
  }
  return SaveStore;
});
