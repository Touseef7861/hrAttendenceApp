import React, { useEffect } from 'react'
import {View,Text,TouchableOpacity,Image} from 'react-native'
import auth from '@react-native-firebase/auth'
import firestore  from '@react-native-firebase/firestore'

const Notification=({navigation})=>{
    // const user =auth.currentUser()

    useEffect(()=>{
        
    },[])
    return(
        <View>
            <View style={{ flexDirection: "row", alignItems: "center",marginTop:10 }}>
                <TouchableOpacity style={{ margin: 10 }} onPress={() => navigation.goBack()}>
                    <Image
                        style={{ height: 20, width: 20 }}
                        source={{ uri: "https://cdn-icons-png.flaticon.com/128/130/130882.png" }}/>
                </TouchableOpacity>
                <Text style={{ marginLeft: 90, fontSize: 18 }}>Notification</Text>
            </View>
            <View style={{flexDirection:'row',alignItems:'center',padding:20,gap:20}}>
                <View style={{height:50,width:50,borderRadius:25,justifyContent:'center',alignItems:'center',backgroundColor:"gray"}}>
                    <Image style={{height:20,width:20}} source={{uri:''}}/>
                </View>
                <View>
                    <Text style={{fontSize:16}}>Your Correction Form Accepted</Text>
                    <Text style={{opacity:0.8}}>Your Application is accepted</Text>
                    <Text style={{opacity:0.5}}>Date/Time</Text>
                </View>
            </View>
        </View>
    )
}

export default Notification;