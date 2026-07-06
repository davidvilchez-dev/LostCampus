package com.david.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class BackendApplicationTests {

	@Test
	void contextLoads() {
	}

	@Test
	void mainMethodTest() {
		BackendApplication.main(new String[]{"--spring.main.web-application-type=none"});
	}

}
