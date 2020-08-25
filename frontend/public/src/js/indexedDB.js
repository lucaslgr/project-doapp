/**
 ** Instanciando um DATABASE no IndexedDB chamado posts-sotre e armazenando na dbPromise
 * 1º Parâmetro: Nome do DB
 * 2º Parâmetro: Versão do DB
 * 3º Parâmetro: Callback que é executado após a criação do DB
 */
let dbPromise = idb.open('app-store', 1, (db) => {
  //? Todos os posts/anuncios do BD
  //* Checando se NÃO existe um objectStore com o nome que desejamos criar para não termos uma duplicidade
  if (!db.objectStoreNames.contains('posts')) {
    /**
     * *Instanciando um ObjectStore no DB app-store, um Object-Store é similar a uma Tabela no BD convencional
     * 1º Parâmetro: Nome do Object Store
     * 2º Parâmetro: JSON definindo o nome da Primmary Key(chamada como keyPath) do Object Store
     */
    db.createObjectStore('posts', { keyPath: 'id' });
  }

  //? Todos os posts inseridos pelo usuário quando o app está sem conexão são armazenados temporariamente para serem sincronizados assim que a conexão voltar
  //* Checando se NÃO existe um objectStore com o nome que desejamos criar para não termos uma duplicidade
  if (!db.objectStoreNames.contains('sync-posts')) {
    /**
     * *Instanciando um ObjectStore no DB app-store, um Object-Store é similar a uma Tabela no BD convencional
     * 1º Parâmetro: Nome do Object Store
     * 2º Parâmetro: JSON definindo o nome da Primmary Key(chamada como keyPath) do Object Store
     */
    db.createObjectStore('sync-posts', { keyPath: 'id' });
  }

  //? Todos os parâmetros da aplicação que são necessários para utilização no SW
  //* Checando se NÃO existe um objectStore com o nome que desejamos criar para não termos uma duplicidade
  if (!db.objectStoreNames.contains('app-params')) {
    /**
     * *Instanciando um ObjectStore no DB app-store, um Object-Store é similar a uma Tabela no BD convencional
     * 1º Parâmetro: Nome do Object Store
     * 2º Parâmetro: JSON definindo o nome da Primmary Key(chamada como keyPath) do Object Store
     */
    db.createObjectStore('app-params');
  }

  //? Todos os posts do respectivo usuário LOGADO
  //* Checando se NÃO existe um objectStore com o nome que desejamos criar para não termos uma duplicidade
  if (!db.objectStoreNames.contains('posts-logged-user')) {
    /**
     * *Instanciando um ObjectStore no DB app-store, um Object-Store é similar a uma Tabela no BD convencional
     * 1º Parâmetro: Nome do Object Store
     * 2º Parâmetro: JSON definindo o nome da Primmary Key(chamada como keyPath) do Object Store
     */
    db.createObjectStore('posts-logged-user', { keyPath: 'id' });
  }
});

/**
 * Função para escrever uma informação no ObjectStore(Tabela) 
 * @param {string} objectStoreName    Nome do ObjectStore
 * @param {JSON} dataToStore          Informação a ser gravada no ObjectStore
 */
function writeData(objectStoreName, dataToStore){
  //Abrindo a Promise que da acesso ao DB 'app-store' do IndexedDB 
  return dbPromise
  .then( db => {
    /**
     * *Criando uma transaction e setando qual o Object-Store(Tabelas) do DB 'app-store' no IndexedDB ela vai operar (1º Parâmetro) e qual permissão ela tem (2º Parâmetro) 
     * 1º Parâmetro: Nome do Object-Store(Tabelas) do DB 'app-store' no IndexedDB que a transaction vai operar
     * 2º Parâmetro: Qual permissão ela tem para operar, readwrite ou readonly
    */
    let transaction = db.transaction(objectStoreName, 'readwrite');

    //Abrindo o Object Store(Tabelas) após a transaction ser configurada acima
    let store = transaction.objectStore(objectStoreName);

    //Guardando cada POST/ANUNCIO no respectivo ObjectStore(Tableas)
    store.put(dataToStore);

    //Fechando a transaction [!OBS: Necessário apenas em transactions com permissão readwrite]
    return transaction.complete;
  });
}

/**
 * Função para escrever uma informação no ObjectStore(Tabela) com uma key específica
 * @param {string} objectStoreName 
 * @param {JSON} dataToStore 
 * @param {string} keyName 
 */
function writeDataWithKey(objectStoreName, dataToStore, keyName){
  //Abrindo a Promise que da acesso ao DB 'app-store' do IndexedDB 
  return dbPromise
  .then( db => {
    /**
     * *Criando uma transaction e setando qual o Object-Store(Tabelas) do DB 'app-store' no IndexedDB ela vai operar (1º Parâmetro) e qual permissão ela tem (2º Parâmetro) 
     * 1º Parâmetro: Nome do Object-Store(Tabelas) do DB 'app-store' no IndexedDB que a transaction vai operar
     * 2º Parâmetro: Qual permissão ela tem para operar, readwrite ou readonly
    */
    let transaction = db.transaction(objectStoreName, 'readwrite');

    //Abrindo o Object Store(Tabelas) após a transaction ser configurada acima
    let store = transaction.objectStore(objectStoreName);

    //Guardando cada POST/ANUNCIO no respectivo ObjectStore(Tableas)
    store.put(dataToStore, keyName);

    //Fechando a transaction [!OBS: Necessário apenas em transactions com permissão readwrite]
    return transaction.complete;
  });
}

/**
 * Função para ler todas informações no respectivo ObjectStore(Tabela) 
 * @param {string} objectStoreName    Nome do ObjectStore
 */
function readAllData(objectStoreName) {
  //Abrindo a Promise que da acesso ao DB 'app-store' do IndexedDB 
  return dbPromise
    .then( db => {
      /**
       * *Criando uma transaction e setando qual o Object-Store(Tabelas) do DB 'app-store' no IndexedDB ela vai operar (1º Parâmetro) e qual permissão ela tem (2º Parâmetro) 
       * 1º Parâmetro: Nome do Object-Store(Tabelas) do DB 'app-store' no IndexedDB que a transaction vai operar
       * 2º Parâmetro: Qual permissão ela tem para operar, readwrite ou readonly
      */
      let transaction = db.transaction(objectStoreName, 'readonly');

      //Abrindo o Object Store(Tableas) após a transaction ser configurada acima
      let store = transaction.objectStore(objectStoreName);

      //Pegando todas informações no respectivo ObjectStore(Tableas)
      return store.getAll();
    });
}

/**
 * Função para ler uma informação respectiva a keyName recebida por parametro do objectStore 
 * @param {string} objectStoreName 
 * @param {string} keyName 
 */
function readDataByKey(objectStoreName, keyName){
  //Abrindo a Promise que da acesso ao DB 'app-store' do IndexedDB 
  return dbPromise
  .then( db => {
    /**
     * *Criando uma transaction e setando qual o Object-Store(Tabelas) do DB 'app-store' no IndexedDB ela vai operar (1º Parâmetro) e qual permissão ela tem (2º Parâmetro) 
     * 1º Parâmetro: Nome do Object-Store(Tabelas) do DB 'app-store' no IndexedDB que a transaction vai operar
     * 2º Parâmetro: Qual permissão ela tem para operar, readwrite ou readonly
    */
    let transaction = db.transaction(objectStoreName, 'readonly');

    //Abrindo o Object Store(Tableas) após a transaction ser configurada acima
    let store = transaction.objectStore(objectStoreName);

    //Pegando as informações da RESPECTIVA KEY no respectivo ObjectStore(Tableas) 
    return store.get(keyName);
  });
}

/**
 * Função para apagar todas informações no respectivo ObjectStore(Tabela) 
 * @param {string} objectStoreName    Nome do ObjectStore
 */
function clearAllData(objectStoreName){
  //Abrindo a Promise que da acesso ao DB 'app-store' do IndexedDB 
  return dbPromise
    .then( db => {
      /**
       * *Criando uma transaction e setando qual o Object-Store(Tabelas) do DB 'app-store' no IndexedDB ela vai operar (1º Parâmetro) e qual permissão ela tem (2º Parâmetro) 
       * 1º Parâmetro: Nome do Object-Store(Tabelas) do DB 'app-store' no IndexedDB que a transaction vai operar
       * 2º Parâmetro: Qual permissão ela tem para operar, readwrite ou readonly
      */
      let transaction = db.transaction(objectStoreName, 'readwrite');

      //Abrindo o Object Store(Tableas) após a transaction ser configurada acima
      let store = transaction.objectStore(objectStoreName);

      //Limpando todas informações no respectivo ObjectStore(Tabelas)
      store.clear();

      //Fechando a transaction [!OBS: Necessário apenas em transactions com permissão readwrite]
      return transaction.complete;
    })
}

/**
 * Função para apagar todas as informações no respectivo ObjectStore(Tablea) de acordo com os IDs inclusos no ArrayIds
 * @param {string} objectStoreName 
 * @param {array} ArrayIds 
 */
function clearAllDataById(objectStoreName, ArrayIds){
  //Percorrendo todos os IDs e deletando
  return ArrayIds.map( (id) => {
    return deleteItemFrom(objectStoreName, id);
  });
}

/**
 * Função para apagar uma informação respectiva ao id passado no respectivo ObjectStore(Tabela) 
 * @param {string} objectStoreName    Nome do ObjectStore
 * @param {int} id                    Id(PrimmaryKey) do objeto no ObjectStore
 */
function deleteItemFromData(objectStoreName, id) {
  //Abrindo a Promise que da acesso ao DB 'app-store' do IndexedDB
  dbPromise
    .then( db => {
      /**
       * *Criando uma transaction e setando qual o Object-Store(Tabelas) do DB 'app-store' no IndexedDB ela vai operar (1º Parâmetro) e qual permissão ela tem (2º Parâmetro) 
       * 1º Parâmetro: Nome do Object-Store(Tabelas) do DB 'app-store' no IndexedDB que a transaction vai operar
       * 2º Parâmetro: Qual permissão ela tem para operar, readwrite ou readonly
      */
      let transaction = db.transaction(objectStoreName, 'readwrite');

      //Abrindo o Object Store(Tableas) após a transaction ser configurada acima
      let store = transaction.objectStore(objectStoreName);

      //Deletando a informação do respectivo ID(PrimmaryKey) no respectivo ObjectStore(Tabelas)
      store.delete(id);

      //Fechando a transaction [!OBS: Necessário apenas em transactions com permissão readwrite]
      return transaction.complete;
    })
    .then( () => {
      console.log('Item deleted from IndexedDB! id:', id);
    })
}