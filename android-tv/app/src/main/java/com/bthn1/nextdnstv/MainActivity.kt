package com.bthn1.nextdnstv

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.focusable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONArray
import org.json.JSONObject
import java.net.URLEncoder
import java.util.concurrent.TimeUnit

private val Bg = Color(0xFF080E18)
private val Panel = Color(0xFF111B2A)
private val Accent = Color(0xFF5795F5)
private val Muted = Color(0xFF9AAAC0)
private const val API_PROXY = "https://nextdns-proxy.batuhan-gulsen15.workers.dev"

data class Profile(val id: String, val name: String)
data class TvStats(val total: Long = 0, val blocked: Long = 0, val devices: List<Pair<String, Long>> = emptyList()) {
    val ratio: String get() = if (total == 0L) "0%" else "%.1f%%".format(blocked * 100.0 / total)
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.statusBarColor = android.graphics.Color.rgb(8, 14, 24)
        window.navigationBarColor = android.graphics.Color.rgb(8, 14, 24)
        setContent { TvApp() }
    }
}

@Composable
private fun TvApp() {
    val scope = rememberCoroutineScope()
    var apiKey by remember { mutableStateOf("") }
    var profileId by remember { mutableStateOf("") }
    var profiles by remember { mutableStateOf(emptyList<Profile>()) }
    var selected by remember { mutableStateOf<Profile?>(null) }
    var stats by remember { mutableStateOf(TvStats()) }
    var error by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(false) }
    var connected by remember { mutableStateOf(false) }
    var tab by remember { mutableStateOf("Genel Bakış") }

    MaterialTheme(colorScheme = darkColorScheme(
        background = Bg, surface = Panel, primary = Accent,
        onBackground = Color.White, onSurface = Color.White
    )) {
        Surface(Modifier.fillMaxSize(), color = Bg) {
            if (!connected) {
                LoginScreen(
                    apiKey = apiKey, onKey = { apiKey = it },
                    profileId = profileId, onProfileId = { profileId = it },
                    error = error, loading = loading,
                    onConnect = {
                        scope.launch {
                            loading = true; error = ""
                            try {
                                profiles = NextDnsApi(apiKey).getProfiles()
                                if (profiles.isEmpty()) error = "Bu API anahtarında profil bulunamadı."
                                else {
                                    selected = profiles.firstOrNull { it.id == profileId } ?: profiles.first()
                                    connected = true
                                    stats = NextDnsApi(apiKey).getStats(selected!!.id)
                                }
                            } catch (e: Exception) { error = e.message ?: "Bağlantı kurulamadı." }
                            loading = false
                        }
                    }
                )
            } else {
                Row(Modifier.fillMaxSize().padding(28.dp), horizontalArrangement = Arrangement.spacedBy(22.dp)) {
                    Column(Modifier.width(220.dp).fillMaxHeight(), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text("NextDNS", fontSize = 27.sp, fontWeight = FontWeight.Bold)
                        Text("TV KONTROL MERKEZİ", color = Muted, fontSize = 10.sp, letterSpacing = 1.4.sp)
                        Spacer(Modifier.height(18.dp))
                        listOf("Genel Bakış", "Cihazlar", "Kurulum").forEach { item ->
                            TvNavButton(item, tab == item) { tab = item }
                        }
                        Spacer(Modifier.weight(1f))
                        Text("Android TV sürümü", color = Muted, fontSize = 11.sp)
                        TvNavButton("Çıkış", false) { connected = false; apiKey = ""; profiles = emptyList() }
                    }
                    Column(Modifier.weight(1f).fillMaxHeight()) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                            Column {
                                Text(tab, fontSize = 28.sp, fontWeight = FontWeight.Bold)
                                Text(selected?.name ?: "", color = Muted, fontSize = 13.sp)
                            }
                            Row(horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.CenterVertically) {
                                if (profiles.size > 1) {
                                    var expanded by remember { mutableStateOf(false) }
                                    Box {
                                        Button(onClick = { expanded = true }) { Text("Profil değiştir") }
                                        DropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
                                            profiles.forEach { p ->
                                                DropdownMenuItem(text = { Text(p.name) }, onClick = {
                                                    expanded = false; selected = p
                                                    scope.launch { loading = true; try { stats = NextDnsApi(apiKey).getStats(p.id) } catch (e: Exception) { error = e.message ?: "Veri alınamadı." }; loading = false }
                                                })
                                            }
                                        }
                                    }
                                }
                                Button(onClick = {
                                    scope.launch { loading = true; try { stats = NextDnsApi(apiKey).getStats(selected!!.id); error = "" } catch (e: Exception) { error = e.message ?: "Yenileme başarısız." }; loading = false }
                                }) { Text("Yenile") }
                            }
                        }
                        Spacer(Modifier.height(22.dp))
                        when (tab) {
                            "Genel Bakış" -> Overview(stats, loading, error)
                            "Cihazlar" -> Devices(stats.devices)
                            else -> Setup(selected?.id ?: "")
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun LoginScreen(apiKey: String, onKey: (String) -> Unit, profileId: String, onProfileId: (String) -> Unit, error: String, loading: Boolean, onConnect: () -> Unit) {
    Column(Modifier.fillMaxSize().padding(48.dp), verticalArrangement = Arrangement.Center, horizontalAlignment = Alignment.CenterHorizontally) {
        Text("NextDNS TV", fontSize = 34.sp, fontWeight = FontWeight.Bold)
        Text("NextDNS PRO panelinin Android TV sürümü", color = Muted, fontSize = 15.sp)
        Spacer(Modifier.height(28.dp))
        Column(Modifier.width(520.dp).background(Panel, RoundedCornerShape(18.dp)).padding(24.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            Text("API anahtarı", color = Muted, fontSize = 13.sp)
            TvInput(apiKey, onKey, secret = true, hint = "NextDNS API anahtarını gir")
            Text("Profil ID (isteğe bağlı)", color = Muted, fontSize = 13.sp)
            TvInput(profileId, onProfileId, hint = "Boş bırakırsan ilk profil seçilir")
            if (error.isNotBlank()) Text(error, color = Color(0xFFFF7777), fontSize = 13.sp)
            Button(onClick = onConnect, enabled = apiKey.isNotBlank() && !loading, modifier = Modifier.fillMaxWidth().height(54.dp)) {
                Text(if (loading) "Bağlanıyor…" else "Panele bağlan", fontSize = 16.sp)
            }
            Text("API anahtarı yalnızca uygulama açıkken bellekte tutulur.", color = Muted, fontSize = 11.sp)
        }
    }
}

@Composable
private fun TvInput(value: String, onValue: (String) -> Unit, secret: Boolean = false, hint: String) {
    BasicTextField(
        value = value, onValueChange = onValue, singleLine = true,
        visualTransformation = if (secret) PasswordVisualTransformation() else androidx.compose.ui.text.input.VisualTransformation.None,
        textStyle = androidx.compose.ui.text.TextStyle(color = Color.White, fontSize = 16.sp),
        modifier = Modifier.fillMaxWidth().background(Color(0xFF08111F), RoundedCornerShape(8.dp)).border(1.dp, Color(0xFF33445D), RoundedCornerShape(8.dp)).padding(16.dp),
        decorationBox = { inner ->
            Box {
                if (value.isEmpty()) Text(hint, color = Muted, fontSize = 14.sp)
                inner()
            }
        }
    )
}

@Composable
private fun TvNavButton(label: String, active: Boolean, onClick: () -> Unit) {
    Button(onClick = onClick, modifier = Modifier.fillMaxWidth().height(52.dp), colors = ButtonDefaults.buttonColors(
        containerColor = if (active) Color(0xFF1C3C67) else Panel,
        contentColor = Color.White
    )) { Text(label, modifier = Modifier.fillMaxWidth(), fontSize = 14.sp) }
}

@Composable
private fun Overview(stats: TvStats, loading: Boolean, error: String) {
    if (loading) Text("Veriler yükleniyor…", color = Muted)
    if (error.isNotBlank()) Text(error, color = Color(0xFFFF7777))
    Row(horizontalArrangement = Arrangement.spacedBy(14.dp)) {
        StatCard("Toplam sorgu", stats.total.toString(), Modifier.weight(1f))
        StatCard("Engellenen", stats.blocked.toString(), Modifier.weight(1f))
        StatCard("Engelleme oranı", stats.ratio, Modifier.weight(1f))
    }
    Spacer(Modifier.height(24.dp))
    Text("Son 30 günün cihazları", fontSize = 18.sp, fontWeight = FontWeight.SemiBold)
    Spacer(Modifier.height(10.dp))
    stats.devices.take(5).forEach { (name, count) ->
        Row(Modifier.fillMaxWidth().background(Panel, RoundedCornerShape(9.dp)).padding(15.dp), horizontalArrangement = Arrangement.SpaceBetween) {
            Text(name, fontSize = 14.sp); Text(count.toString(), color = Muted)
        }
        Spacer(Modifier.height(7.dp))
    }
}

@Composable
private fun StatCard(title: String, value: String, modifier: Modifier = Modifier) {
    Column(modifier.height(120.dp).background(Panel, RoundedCornerShape(14.dp)).padding(18.dp), verticalArrangement = Arrangement.SpaceBetween) {
        Text(title, color = Muted, fontSize = 13.sp)
        Text(value, fontSize = 27.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun Devices(devices: List<Pair<String, Long>>) {
    LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        items(devices) { (name, count) ->
            Row(Modifier.fillMaxWidth().background(Panel, RoundedCornerShape(10.dp)).padding(16.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                Text(name, fontSize = 16.sp); Text("$count sorgu", color = Muted)
            }
        }
    }
}

@Composable
private fun Setup(id: String) {
    Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Text("Bu profilin cihaz kurulum bilgileri", color = Muted)
        InfoCard("DNS-over-HTTPS", "https://dns.nextdns.io/$id")
        InfoCard("DNS-over-TLS", "$id.dns.nextdns.io")
        InfoCard("Profil ID", id)
    }
}

@Composable
private fun InfoCard(title: String, value: String) {
    Column(Modifier.fillMaxWidth().background(Panel, RoundedCornerShape(10.dp)).padding(16.dp)) {
        Text(title, color = Muted, fontSize = 12.sp)
        Spacer(Modifier.height(5.dp))
        Text(value, fontSize = 16.sp)
    }
}

private class NextDnsApi(private val apiKey: String) {
    private val client = OkHttpClient.Builder().callTimeout(25, TimeUnit.SECONDS).build()
    private suspend fun get(path: String): JSONObject = withContext(Dispatchers.IO) {
        val request = Request.Builder().url(API_PROXY + path)
            .header("X-Api-Key", apiKey).header("Accept", "application/json").get().build()
        client.newCall(request).execute().use { response ->
            val body = response.body?.string().orEmpty()
            if (!response.isSuccessful) throw IllegalStateException("NextDNS bağlantı hatası: HTTP ${response.code}")
            JSONObject(body)
        }
    }

    suspend fun getProfiles(): List<Profile> {
        val data = get("/profiles").optJSONArray("data") ?: JSONArray()
        return (0 until data.length()).map { i ->
            val p = data.getJSONObject(i)
            Profile(p.optString("id"), p.optString("name").ifBlank { p.optString("id") })
        }.filter { it.id.isNotBlank() }
    }

    suspend fun getStats(id: String): TvStats {
        val status = get("/profiles/${URLEncoder.encode(id, "UTF-8")}/analytics/status").optJSONArray("data") ?: JSONArray()
        var total = 0L; var blocked = 0L
        for (i in 0 until status.length()) {
            val item = status.getJSONObject(i)
            val queries = item.optLong("queries", 0)
            total += queries
            if (item.optString("status") == "blocked") blocked += queries
        }
        val devicesJson = get("/profiles/${URLEncoder.encode(id, "UTF-8")}/analytics/devices?from=-30d&limit=500").optJSONArray("data") ?: JSONArray()
        val devices = (0 until devicesJson.length()).map { i ->
            val item = devicesJson.getJSONObject(i)
            item.optString("name").ifBlank { item.optString("deviceName").ifBlank { "Bilinmeyen cihaz" } } to item.optLong("queries", 0)
        }.sortedByDescending { it.second }
        return TvStats(total, blocked, devices)
    }
}
