package com.snoutify.snoutify

import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.Before
import org.junit.Test

class FakeLibraryServiceTest {
    lateinit var service: FakeLibraryService

    @Before
    fun beforeEach() {
        service = FakeLibraryService(listOf(album1, album2, album3))
    }

    @Test
    fun getAlbum_notFound_returnsEmptyList() {
        val paginatedLibraryAlbums = service.getAlbum(42)

        assertThat(paginatedLibraryAlbums).isEqualTo(
                PaginatedLibraryAlbums(items = emptyList(), total = 3)
        )
    }

    @Test
    fun getAlbum_found_returnsAlbum() {
        val paginatedLibraryAlbums = service.getAlbum(1)

        assertThat(paginatedLibraryAlbums).isEqualTo(
                PaginatedLibraryAlbums(items = listOf(LibraryAlbum(album2)), total = 3)
        )
    }

    @Test
    fun getAlbum_crashRequested_throws() {
        service.setCrash(true)

        assertThatThrownBy {
            service.getAlbum(1)
        }.isInstanceOf(RuntimeException::class.java)
    }
}
