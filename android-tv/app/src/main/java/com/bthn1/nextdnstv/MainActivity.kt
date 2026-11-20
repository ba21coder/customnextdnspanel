package com.bthn1.nextdnstv

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.net.URLEncoder
import java.util.concurrent.TimeUnit

private val Bg=Color(0xFF080E18); private val Panel=Color(0xFF111B2A); private val Accent=Color(0xFF5795F5); private val Muted=Color(0xFF9AAAC0)
private const val API_PROXY="https://nextdns-proxy.batuhan-gulsen15.workers.dev"
private val parentalServices=listOf("TikTok","Instagram","YouTube","Roblox","Minecraft","Discord","Facebook","Twitter","Snapchat","Netflix","Twitch","Steam")
data class Profile(val id:String,val name:String)
data class Rule(val id:String)
data class LogEntry(val domain:String,val device:String,val status:String,val protocol:String,val time:String)
data class Stats(val total:Long=0,val blocked:Long=0,val devices:List<Pair<String,Long>>=emptyList(),val domains:List<Pair<String,Long>>=emptyList()){val ratio get()=if(total==0L)"0%" else "%.1f%%".format(blocked*100.0/total)}

class MainActivity:ComponentActivity(){override fun onCreate(savedInstanceState:Bundle?){super.onCreate(savedInstanceState);window.statusBarColor=android.graphics.Color.rgb(8,14,24);window.navigationBarColor=android.graphics.Color.rgb(8,14,24);setContent{TvApp()}}}

@Composable private fun TvApp(){
 val scope= rememberCoroutineScope()
 var key by remember{mutableStateOf("")};var profileText by remember{mutableStateOf("")};var profiles by remember{mutableStateOf(emptyList<Profile>())};var selected by remember{mutableStateOf<Profile?>(null)}
 var stats by remember{mutableStateOf(Stats())};var logs by remember{mutableStateOf(emptyList<LogEntry>())};var deny by remember{mutableStateOf(emptyList<Rule>())};var allow by remember{mutableStateOf(emptyList<Rule>())};var parental by remember{mutableStateOf(emptySet<String>())};var privacy by remember{mutableStateOf(emptyList<String>())}
 var doh by remember{mutableStateOf("")};var dot by remember{mutableStateOf("")};var ipv6 by remember{mutableStateOf("")};var linkedIp by remember{mutableStateOf("")}
 var tab by remember{mutableStateOf("Genel Bakış")};var connected by remember{mutableStateOf(false)};var loading by remember{mutableStateOf(false)};var error by remember{mutableStateOf("")}
 var domain by remember{mutableStateOf("")};var search by remember{mutableStateOf("")};var logFilter by remember{mutableStateOf("Tümü")}
 fun runTask(block:suspend()->Unit){scope.launch{loading=true;error="";try{block()}catch(e:Exception){error=e.message?: "İşlem tamamlanamadı."};loading=false}}
 suspend fun refresh(p:Profile){
  val api=NextDnsApi(key);stats=api.stats(p.id);logs=api.logs(p.id);deny=api.rules(p.id,"denylist");allow=api.rules(p.id,"allowlist");parental=api.parental(p.id)
  val obj=api.profile(p.id);privacy=obj.optJSONObject("privacy")?.optJSONArray("blocklists")?.strings("id")?:emptyList()
  doh="https://dns.nextdns.io/${p.id}";dot="${p.id}.dns.nextdns.io";ipv6=obj.optJSONObject("setup")?.optJSONArray("ipv6")?.let{a->(0 until a.length()).joinToString("\n"){a.optString(it)}}.orEmpty()
  linkedIp=obj.optJSONObject("setup")?.optJSONObject("linkedIp")?.optString("ip").orEmpty().ifBlank{"Yok"}
 }
 MaterialTheme(colorScheme=darkColorScheme(background=Bg,surface=Panel,primary=Accent,onBackground=Color.White,onSurface=Color.White)){
  Surface(Modifier.fillMaxSize(),color=Bg){
   if(!connected){
    Column(Modifier.fillMaxSize().padding(40.dp),horizontalAlignment=Alignment.CenterHorizontally,verticalArrangement=Arrangement.Center){
     Text("NextDNS PRO",fontSize=36.sp,fontWeight=FontWeight.Bold);Text("ANDROID TV • KUMANDA İLE KONTROL",color=Accent,fontSize=12.sp)
     Spacer(Modifier.height(22.dp))
     Column(Modifier.width(520.dp).background(Panel,RoundedCornerShape(18.dp)).padding(24.dp),verticalArrangement=Arrangement.spacedBy(13.dp)){
      Text("NextDNS API anahtarı",color=Muted);TvInput(key,{key=it},true,"API anahtarını gir")
      Text("Profil ID (isteğe bağlı)",color=Muted);TvInput(profileText,{profileText=it},false,"Boş bırak: ilk profil")
      if(error.isNotBlank())Text(error,color=Color(0xFFFF7777))
      Button(onClick={runTask{val found=NextDnsApi(key).profiles();if(found.isEmpty())throw Exception("Bu anahtarda profil bulunamadı.");profiles=found;selected=found.firstOrNull{it.id==profileText}?:found.first();refresh(selected!!);connected=true}},enabled=key.isNotBlank()&&!loading,modifier=Modifier.fillMaxWidth().height(54.dp)){Text(if(loading)"Bağlanıyor…" else "Panele bağlan")}
      Text("API anahtarı kalıcı olarak kaydedilmez; uygulama belleğinde tutulur.",color=Muted,fontSize=11.sp)
     }
    }
   }else{
    Row(Modifier.fillMaxSize().padding(24.dp),horizontalArrangement=Arrangement.spacedBy(18.dp)){
     Column(Modifier.width(215.dp).fillMaxHeight(),verticalArrangement=Arrangement.spacedBy(7.dp)){
      Text("NextDNS PRO",fontSize=24.sp,fontWeight=FontWeight.Bold);Text("TV CONTROL CENTER",fontSize=10.sp,color=Muted)
      Spacer(Modifier.height(12.dp))
      listOf("Genel Bakış","Canlı Trafik","Kara & Beyaz Liste","Ebeveyn Kontrolü","Gizlilik & Filtreler","Kurulum").forEach{Nav(it,tab==it){tab=it}}
      Spacer(Modifier.weight(1f));Nav("Çıkış",false){connected=false;key="";profiles=emptyList()}
     }
     Column(Modifier.weight(1f).fillMaxHeight()){
      Row(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.SpaceBetween,verticalAlignment=Alignment.CenterVertically){
       Column{Text(tab,fontSize=26.sp,fontWeight=FontWeight.Bold);Text(selected?.name.orEmpty(),color=Muted,fontSize=12.sp)}
       Row(horizontalArrangement=Arrangement.spacedBy(8.dp)){
        if(profiles.size>1){var expanded by remember{mutableStateOf(false)};Box{Button(onClick={expanded=true}){Text("Profil seç")};DropdownMenu(expanded,{expanded=false}){profiles.forEach{p->DropdownMenuItem(text={Text(p.name)},onClick={expanded=false;selected=p;runTask{refresh(p)}})}}}}
        Button(onClick={selected?.let{p->{runTask{refresh(p)}}}){Text("Yenile")}
       }
      }
      Spacer(Modifier.height(14.dp));if(loading)Text("Yükleniyor…",color=Muted);if(error.isNotBlank())Text(error,color=Color(0xFFFF7777),fontSize=12.sp)
      when(tab){
       "Genel Bakış"->Overview(stats)
       "Canlı Trafik"->{
        Row(horizontalArrangement=Arrangement.spacedBy(8.dp),verticalAlignment=Alignment.CenterVertically){TvInput(search,{search=it},false,"Alan adı veya cihaz ara");listOf("Tümü","Engellendi","İzin verildi").forEach{Filter(it,logFilter==it){logFilter=it}}}
        Spacer(Modifier.height(8.dp))
        LazyColumn(verticalArrangement=Arrangement.spacedBy(6.dp)){items(logs.filter{(it.domain.contains(search,true)||it.device.contains(search,true))&&(logFilter=="Tümü"||(logFilter=="Engellendi"&&it.status=="blocked")||(logFilter=="İzin verildi"&&it.status!="blocked"))}){l->
         Row(Modifier.fillMaxWidth().background(Panel,RoundedCornerShape(9.dp)).padding(10.dp),verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.spacedBy(8.dp)){
          Column(Modifier.weight(1f)){Text(l.domain,fontWeight=FontWeight.SemiBold,fontSize=13.sp);Text("${l.device} • ${l.time} • ${l.protocol}",fontSize=10.sp,color=Muted)}
          Text(if(l.status=="blocked")"ENGELLİ" else "İZİN",fontSize=10.sp,color=if(l.status=="blocked")Color(0xFFFF7777) else Color(0xFF66D9A3))
          Button(onClick={runTask{NextDnsApi(key).addRule(selected!!.id,if(l.status=="blocked")"allowlist" else "denylist",l.domain);refresh(selected!!)}}){Text(if(l.status=="blocked")"İzin ver" else "Engelle")}
         }
        }}
       }
       "Kara & Beyaz Liste"->{
        TvInput(domain,{domain=it},false,"ornek.com")
        Row(horizontalArrangement=Arrangement.spacedBy(8.dp)){Button(onClick={runTask{NextDnsApi(key).addRule(selected!!.id,"denylist",domain);domain="";refresh(selected!!)}}){Text("Kara listeye ekle")};Button(onClick={runTask{NextDnsApi(key).addRule(selected!!.id,"allowlist",domain);domain="";refresh(selected!!)}}){Text("Beyaz listeye ekle")}}
        Spacer(Modifier.height(10.dp));Row(Modifier.weight(1f),horizontalArrangement=Arrangement.spacedBy(10.dp)){RuleList("KARA LİSTE",deny){r->runTask{NextDnsApi(key).removeRule(selected!!.id,"denylist",r.id);refresh(selected!!)}};RuleList("BEYAZ LİSTE",allow){r->runTask{NextDnsApi(key).removeRule(selected!!.id,"allowlist",r.id);refresh(selected!!)}}}
       }
       "Ebeveyn Kontrolü"->LazyColumn(verticalArrangement=Arrangement.spacedBy(7.dp)){items(parentalServices){name->val id=serviceId(name);val active=parental.contains(id);Row(Modifier.fillMaxWidth().background(Panel,RoundedCornerShape(9.dp)).padding(12.dp),horizontalArrangement=Arrangement.SpaceBetween,verticalAlignment=Alignment.CenterVertically){Text(name,fontSize=15.sp);Button(onClick={runTask{NextDnsApi(key).toggleService(selected!!.id,id,active);parental=NextDnsApi(key).parental(selected!!.id)}}){Text(if(active)"Engeli kaldır" else "Engelle")}}}}
       "Gizlilik & Filtreler"->{
        Text("Profilden okunan etkin filtre listeleri",color=Muted);if(privacy.isEmpty())Text("Etkin özel filtre listesi bulunamadı.")
        privacy.forEach{Info(it,"Etkin")};Spacer(Modifier.height(10.dp));Text("Not: Bu sürüm filtreleri görüntüler; özel liste ekleme ve düzenleme profil API'sinde desteklenen alanlarla ayrıca eklenebilir.",color=Muted,fontSize=11.sp)
       }
       else->{Info("DNS-over-HTTPS",doh);Info("DNS-over-TLS",dot);Info("IPv6",ipv6.ifBlank{"Profilde IPv6 bilgisi yok"});Info("Bağlı IPv4",linkedIp);Info("Profil ID",selected?.id.orEmpty())}
      }
     }
    }
   }
  }
 }
}

@Composable private fun TvInput(value:String,onValue:(String)->Unit,secret:Boolean=false,hint:String){
 BasicTextField(value,onValueChange=onValue,singleLine=true,visualTransformation=if(secret)PasswordVisualTransformation() else androidx.compose.ui.text.input.VisualTransformation.None,textStyle=androidx.compose.ui.text.TextStyle(color=Color.White,fontSize=14.sp),modifier=Modifier.fillMaxWidth().background(Color(0xFF08111F),RoundedCornerShape(8.dp)).border(1.dp,Color(0xFF33445D),RoundedCornerShape(8.dp)).padding(12.dp),decorationBox={inner->Box{if(value.isEmpty())Text(hint,color=Muted);inner()}})
}
@Composable private fun Nav(label:String,active:Boolean,onClick:()->Unit){Button(onClick=onClick,modifier=Modifier.fillMaxWidth().height(48.dp),colors=ButtonDefaults.buttonColors(containerColor=if(active)Color(0xFF1C3C67) else Panel)){Text(label,modifier=Modifier.fillMaxWidth(),fontSize=12.sp)}}
@Composable private fun Filter(label:String,active:Boolean,onClick:()->Unit){Button(onClick=onClick,colors=ButtonDefaults.buttonColors(containerColor=if(active)Accent else Panel)){Text(label,fontSize=11.sp)}}
@Composable private fun Overview(s:Stats){
 Row(horizontalArrangement=Arrangement.spacedBy(10.dp)){Metric("Toplam sorgu",s.total.toString(),Modifier.weight(1f));Metric("Engellenen",s.blocked.toString(),Modifier.weight(1f));Metric("Engelleme oranı",s.ratio,Modifier.weight(1f))}
 Spacer(Modifier.height(16.dp));Text("Cihazlar • Son 30 gün",fontSize=17.sp,fontWeight=FontWeight.SemiBold);s.devices.take(8).forEach{Info(it.first,"${it.second} sorgu")}
 Spacer(Modifier.height(10.dp));Text("En çok engellenen alan adları",fontSize=17.sp,fontWeight=FontWeight.SemiBold);s.domains.take(8).forEach{Info(it.first,"${it.second} sorgu")}
}
@Composable private fun Metric(title:String,value:String,modifier:Modifier){Column(modifier.height(105.dp).background(Panel,RoundedCornerShape(12.dp)).padding(14.dp),verticalArrangement=Arrangement.SpaceBetween){Text(title,color=Muted,fontSize=11.sp);Text(value,fontSize=24.sp,fontWeight=FontWeight.Bold)}}
@Composable private fun Info(title:String,value:String){Column(Modifier.fillMaxWidth().background(Panel,RoundedCornerShape(9.dp)).padding(12.dp)){Text(title,fontSize=13.sp,fontWeight=FontWeight.Medium);Text(value,color=Muted,fontSize=11.sp)}}
@Composable private fun RuleList(title:String,rules:List<Rule>,remove:(Rule)->Unit){Column(Modifier.weight(1f).fillMaxHeight()){Text("$title (${rules.size})",fontWeight=FontWeight.Bold);LazyColumn(verticalArrangement=Arrangement.spacedBy(5.dp)){items(rules){r->Row(Modifier.fillMaxWidth().background(Panel,RoundedCornerShape(8.dp)).padding(8.dp),horizontalArrangement=Arrangement.SpaceBetween,verticalAlignment=Alignment.CenterVertically){Text(r.id,fontSize=11.sp);Button(onClick={remove(r)}){Text("Sil")}}}}}}
private fun serviceId(name:String)=when(name){"Twitter"->"twitter";else->name.lowercase()}
private fun JSONArray.strings(key:String):List<String>=(0 until length()).mapNotNull{optJSONObject(it)?.optString(key)?.takeIf{s->s.isNotBlank()}}

private class NextDnsApi(private val apiKey:String){
 private val client=OkHttpClient.Builder().callTimeout(25,TimeUnit.SECONDS).build()
 private suspend fun request(path:String,method:String="GET",data:JSONObject?=null):JSONObject=withContext(Dispatchers.IO){
  val media="application/json; charset=utf-8".toMediaType();val body=data?.toString()?.toRequestBody(media)
  val b=Request.Builder().url(API_PROXY+path).header("X-Api-Key",apiKey).header("Accept","application/json")
  when(method){"POST"->b.post(body?: "{}".toRequestBody(media));"DELETE"->b.delete();else->b.get()}
  client.newCall(b.build()).execute().use{res->val raw=res.body?.string().orEmpty();if(!res.isSuccessful)throw IllegalStateException("API HTTP ${res.code}: ${raw.take(160)}");if(raw.isBlank())JSONObject() else JSONObject(raw)}
 }
 private fun enc(s:String)=URLEncoder.encode(s,"UTF-8")
 suspend fun profiles():List<Profile>{val a=request("/profiles").optJSONArray("data")?:JSONArray();return (0 until a.length()).map{a.getJSONObject(it)}.map{Profile(it.optString("id"),it.optString("name").ifBlank{it.optString("id")})}.filter{it.id.isNotBlank()}}
 suspend fun stats(id:String):Stats{
  val a=request("/profiles/${enc(id)}/analytics/status").optJSONArray("data")?:JSONArray();var total=0L;var blocked=0L
  for(i in 0 until a.length()){val x=a.getJSONObject(i);val n=x.optLong("queries");total+=n;if(x.optString("status")=="blocked")blocked+=n}
  val d=request("/profiles/${enc(id)}/analytics/devices?from=-30d&limit=500").optJSONArray("data")?:JSONArray()
  val devices=(0 until d.length()).map{val x=d.getJSONObject(it);(x.optString("name").ifBlank{x.optString("deviceName").ifBlank{x.optString("id")}}) to x.optLong("queries")}.sortedByDescending{it.second}
  val t=request("/profiles/${enc(id)}/analytics/domains?status=blocked&limit=8").optJSONArray("data")?:JSONArray()
  val domains=(0 until t.length()).map{val x=t.getJSONObject(it);x.optString("domain").ifBlank{x.optString("name")} to x.optLong("queries")}
  return Stats(total,blocked,devices,domains)
 }
 suspend fun logs(id:String):List<LogEntry>{val a=request("/profiles/${enc(id)}/logs?limit=100").optJSONArray("data")?:JSONArray();return (0 until a.length()).map{val x=a.getJSONObject(it);LogEntry(x.optString("domain").ifBlank{x.optString("name")},x.optJSONObject("device")?.optString("name")?:x.optString("client"),x.optString("status"),x.optString("protocol"),x.optString("timestamp"))}}
 suspend fun rules(id:String,type:String):List<Rule>{val a=request("/profiles/${enc(id)}/$type").optJSONArray("data")?:JSONArray();return (0 until a.length()).mapNotNull{a.optJSONObject(it)?.optString("id")?.takeIf{s->s.isNotBlank()}?.let{v->Rule(v)}}}
 suspend fun addRule(id:String,type:String,domain:String){require(domain.matches(Regex("(?i)([a-z0-9-]+\\.)+[a-z]{2,}"))){"Geçerli bir alan adı gir."};request("/profiles/${enc(id)}/$type","POST",JSONObject().put("id",domain).put("active",true))}
 suspend fun removeRule(id:String,type:String,domain:String){request("/profiles/${enc(id)}/$type/${enc(domain)}","DELETE")}
 suspend fun parental(id:String):Set<String>{val a=request("/profiles/${enc(id)}/parentalControl").optJSONObject("data")?.optJSONArray("services")?:JSONArray();return (0 until a.length()).mapNotNull{a.optJSONObject(it)?.optString("id")}.toSet()}
 suspend fun toggleService(id:String,service:String,active:Boolean){if(active)request("/profiles/${enc(id)}/parentalControl/services/${enc(service)}","DELETE") else request("/profiles/${enc(id)}/parentalControl/services","POST",JSONObject().put("id",service).put("active",true))}
 suspend fun profile(id:String)=request("/profiles/${enc(id)}").optJSONObject("data")?:JSONObject()
}