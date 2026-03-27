import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:provider/provider.dart';
import 'package:eduspace_mobile_v2/presentation/providers/auth/auth_provider.dart';
import 'package:eduspace_mobile_v2/presentation/providers/message/message_provider.dart';
import 'package:eduspace_mobile_v2/routes/app_router.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: ".env");
  
  final authProvider = AuthProvider();
  await authProvider.checkLoginStatus();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: authProvider),
        ChangeNotifierProvider(create: (_) => MessageProvider()),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    
    return MaterialApp(
      navigatorKey: AppRouter.navigatorKey,
      title: 'EduSpace Mobile V2',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF030213)),
        useMaterial3: true,
      ),
      onGenerateRoute: AppRouter.generateRoute,
      initialRoute: authProvider.isLoggedIn ? AppRouter.home : AppRouter.login,
    );
  }
}
