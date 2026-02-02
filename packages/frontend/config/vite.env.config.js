import { defineConfig } from 'vite'
import fs from "fs";
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({

	plugins: [ tailwindcss(),],
	server: {


		https: {
			key: fs.readFileSync("./config/certs/selfsigned.key"),
			cert: fs.readFileSync("./config/certs/selfsigned.crt"),
			minVersion: "TLSv1.3",
		},
		proxy: {
			'/api': {
				target: 'https://backend:3000/',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, ''),
                ws: true,
				secure: false, // <--- ignore le certificat auto-signé, ne perds pas le chiffrement TLS, tu ignores juste la vérification que le certificat est signé par une autorité de confiance
			},
		},
	}
})

// maintenant si on fait https://localhost:5173/api 5173 = le front, on tombe sur hello capy = le back