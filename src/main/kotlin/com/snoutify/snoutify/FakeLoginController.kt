package com.snoutify.snoutify

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
class FakeLoginController {
    @GetMapping("/fake/authorize")
    fun authorize(@RequestParam("redirect_uri") redirectUri: String): ResponseEntity<Void> {
        val redirect = "$redirectUri?access_token=valid-token"

        return ResponseEntity.status(HttpStatus.FOUND)
                .header("Location", redirect)
                .build()
    }

    @GetMapping("/fake/logout")
    fun authorize(): ResponseEntity<String> {
        return ResponseEntity.status(HttpStatus.FOUND)
                .header("Content-Type", "text/html")
                .body(logoutPage)
    }

    val logoutPage = """
        <body class="logout-page">
            You are logged out.
        </body>
    """.trimIndent()
}