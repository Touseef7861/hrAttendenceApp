import React, { useEffect, useState } from 'react';
import { View,Image } from 'react-native';
import Navigation from './src/Navigation/Navigation';


const SplashScreen = () => {
  const [check, setCheck] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setCheck(true);
    }, 2000);
  }, []); 

  if (check === false) {
    return (
      <View style={{  flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'white'}}>
          <Image style={{height:'40%',width:'50%'}} source={{uri:'https://media.licdn.com/dms/image/v2/D4D0BAQFPrR_MWMq_QQ/company-logo_200_200/company-logo_200_200/0/1723714983811/the_first_sol_logo?e=2147483647&v=beta&t=f3O5sgdVp-74IpCtm3UCIkAZ9NCZ_qwg1P_3e85EVhk'}}/>
      </View>
    );
  } else {
    return <Navigation/>; 
  }
};

export default SplashScreen;
