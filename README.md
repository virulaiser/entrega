Entrega para coder React native la prueba final

por un tema de tiempo separe en dos componentes en la APP.js , los vas a ver comentado , pero funcionan por separad

componente 1 <AppNavigator/> es el login y record  (con firebase en bd remota) con persistencia local de seccion  y luego vas a la sesion de GPS ( en el celular anda)

componente 2 <HomeScreens/> usando firestore graba al precionar un boton, localmente  { articulo: "licuadora", cantidad: 1 } y si preciono otro se graba en firestore.

componente 3 <Opitimi/> genera una lista random con facker ,optimisada con FlatView & SafeAreaView,
se suma a: db -> /database/db funciones con SQlite , agreaga articulo random y borra todo