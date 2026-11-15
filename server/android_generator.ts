/**
 * TALKRENT Android Kotlin Project Blueprint Generator
 * Provides complete Kotlin models, Retrofit ApiService, and Activity code for Android Studio.
 */

export function generateAndroidKotlinFiles(): { [filename: string]: string } {
  return {
    'build.gradle.kts': `// App-level build.gradle.kts for TALKRENT Android App
plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "id.talkrent.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "id.talkrent.app"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildFeatures {
        viewBinding = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.constraintlayout:constraintlayout:2.2.0")
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.8.7")
    implementation("androidx.lifecycle:lifecycle-livedata-ktx:2.8.7")

    // Retrofit & Moshi / Gson for TALKRENT REST API
    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    implementation("com.squareup.retrofit2:converter-gson:2.11.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")

    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")
}
`,

    'TalkRentModels.kt': `package id.talkrent.app.data.model

import com.google.gson.annotations.SerializedName

data class ApiResponse<T>(
    @SerializedName("success") val success: Boolean,
    @SerializedName("data") val data: T?,
    @SerializedName("message") val message: String?
)

data class DashboardStats(
    @SerializedName("totalUnits") val totalUnits: Int,
    @SerializedName("availableUnits") val availableUnits: Int,
    @SerializedName("rentedUnits") val rentedUnits: Int,
    @SerializedName("maintenanceUnits") val maintenanceUnits: Int,
    @SerializedName("activeBookings") val activeBookings: Int,
    @SerializedName("ongoingRentals") val ongoingRentals: Int,
    @SerializedName("todayRevenue") val todayRevenue: Double,
    @SerializedName("monthRevenue") val monthRevenue: Double
)

data class DashboardOverview(
    @SerializedName("stats") val stats: DashboardStats
)

data class EquipmentUnit(
    @SerializedName("id") val id: Int,
    @SerializedName("unit_code") val unitCode: String,
    @SerializedName("serial_number") val serialNumber: String,
    @SerializedName("physical_condition") val physicalCondition: String,
    @SerializedName("battery_health") val batteryHealth: Int,
    @SerializedName("status") val status: String,
    @SerializedName("notes") val notes: String?
)

data class Customer(
    @SerializedName("id") val id: Int,
    @SerializedName("customer_code") val customerCode: String,
    @SerializedName("name") val name: String,
    @SerializedName("whatsapp") val whatsapp: String,
    @SerializedName("organization") val organization: String?,
    @SerializedName("address") val address: String?
)

data class Booking(
    @SerializedName("id") val id: Int,
    @SerializedName("booking_code") val bookingCode: String,
    @SerializedName("event_name") val eventName: String,
    @SerializedName("start_date") val startDate: String,
    @SerializedName("end_date") val endDate: String,
    @SerializedName("requested_quantity") val requestedQuantity: Int,
    @SerializedName("status") val status: String
)

data class Rental(
    @SerializedName("id") val id: Int,
    @SerializedName("rental_code") val rentalCode: String,
    @SerializedName("out_date") val outDate: String,
    @SerializedName("due_date") val dueDate: String,
    @SerializedName("total_cost") val totalCost: Double,
    @SerializedName("rental_status") val rentalStatus: String,
    @SerializedName("payment_status") val paymentStatus: String
)
`,

    'TalkRentApiService.kt': `package id.talkrent.app.data.api

import id.talkrent.app.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface TalkRentApiService {

    @POST("api/auth/login")
    suspend fun login(
        @Body credentials: Map<String, String>
    ): Response<ApiResponse<Map<String, Any>>>

    @GET("api/dashboard/overview")
    suspend fun getDashboardOverview(): Response<ApiResponse<DashboardOverview>>

    @GET("api/units")
    suspend fun getUnits(
        @Query("status") status: String? = null
    ): Response<ApiResponse<List<EquipmentUnit>>>

    @GET("api/customers")
    suspend fun getCustomers(
        @Query("search") search: String? = null
    ): Response<ApiResponse<List<Customer>>>

    @GET("api/bookings")
    suspend fun getBookings(
        @Query("status") status: String? = null
    ): Response<ApiResponse<List<Booking>>>

    @GET("api/rentals")
    suspend fun getRentals(
        @Query("status") status: String? = null
    ): Response<ApiResponse<List<Rental>>>
}
`,

    'ApiClient.kt': `package id.talkrent.app.data.api

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object ApiClient {
    // Ganti BASE_URL dengan IP Server XAMPP / Cloud Run TALKRENT
    // Contoh lokal emulator: "http://10.0.2.2/talkrent/api.php?action="
    // Contoh hosting: "https://your-domain.com/api/"
    private const val BASE_URL = "http://10.0.2.2:3000/"

    private val logging = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val httpClient = OkHttpClient.Builder()
        .addInterceptor(logging)
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .build()

    val apiService: TalkRentApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(httpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(TalkRentApiService::class.java)
    }
}
`
  };
}
