import React,{useEffect} from "react";
import {View,Text,TouchableOpacity,Image} from 'react-native'
import { useNavigation,useRoute } from "@react-navigation/native";

const LeaveDetails=()=>{
    const navigation =useNavigation()
    const route = useRoute();
    const { data } = route.params || {};
    return(
        <View style={{flex:1}}>
            <View style={{ flexDirection: "row", alignItems: "center",marginTop:10 }}>
                <TouchableOpacity style={{ margin: 10 }} onPress={() => navigation.goBack()}>
                    <Image
                        style={{ height: 20, width: 20 }}
                        source={{ uri: "https://cdn-icons-png.flaticon.com/128/130/130882.png" }}/>
                </TouchableOpacity>
                <Text style={{ marginLeft: 90, fontSize: 18 }}>Leave Details</Text>
            </View>
            <View style={{ margin: 20, gap: 20 }}>
               <View style={{borderBottomWidth:0.2,}}>
                    <Text style={{opacity:0.5}}>Title</Text>
                    <Text style={{fontSize:18}}>{data.title}</Text>
               </View>
               <View style={{borderBottomWidth:0.2,}}>
                    <Text style={{opacity:0.5}}>Leave Type</Text>
                    <Text style={{fontSize:18}}>{data.leaveType}</Text>
               </View>
               <View style={{borderBottomWidth:0.2,}}>
                    <Text style={{opacity:0.5}}>Date</Text>
                    <Text style={{fontSize:18}}>{data.startDate}  -  {data.endDate}</Text>
               </View>
               <View style={{borderBottomWidth:0.2,}}>
                    <Text style={{opacity:0.5}}>Reason</Text>
                    <Text style={{fontSize:18}}>{data.reason}</Text>
               </View>
               <View style={{borderBottomWidth:0.2,}}>
                    <Text style={{opacity:0.5}}>Applied on</Text>
                    <Text style={{fontSize:18}}>{data.appliedOn}</Text>
               </View>
               <View style={{borderBottomWidth:0.2,}}>
                    <Text style={{opacity:0.5}}>Contact Number</Text>
                    <Text style={{fontSize:18}}>{data.contact}</Text>
               </View>
               <View style={{borderBottomWidth:0.2,}}>
                    <Text style={{opacity:0.5}}>Status</Text>
                    <Text style={{fontSize:18}}>{data.status}</Text>
               </View>
               <View style={{borderBottomWidth:0.2,}}>
                    <Text style={{opacity:0.5}}>Approved by</Text>
                    <Text style={{fontSize:18}}>Waheed</Text>
               </View>
            </View>
        </View>
    )
}

export default LeaveDetails;