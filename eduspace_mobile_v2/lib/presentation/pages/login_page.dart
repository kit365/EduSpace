import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:eduspace_mobile_v2/presentation/providers/auth/auth_provider.dart';
import 'package:eduspace_mobile_v2/core/utils/snackbar_utils.dart';
import 'package:eduspace_mobile_v2/presentation/common/widgets/custom_text_field.dart';
import 'package:eduspace_mobile_v2/presentation/common/widgets/primary_button.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  Future<void> _handleLogin() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    if (email.isEmpty || password.isEmpty) {
      SnackBarUtils.show(
        context,
        'Vui lòng nhập đầy đủ email và mật khẩu!',
        isError: true,
      );
      return;
    }

    try {
      final authProvider = context.read<AuthProvider>();
      final success = await authProvider.login(email, password);

      if (!mounted) return;

      if (success) {
        SnackBarUtils.show(context, 'Đăng nhập thành công!');
        // Navigator.pushReplacementNamed(context, '/home'); // Add home route later
      } else {
        SnackBarUtils.show(
          context,
          authProvider.error ?? 'Đăng nhập thất bại!',
          isError: true,
        );
      }
    } catch (e) {
      if (mounted) {
        SnackBarUtils.show(context, 'Đã xảy ra lỗi: ${e.toString()}', isError: true);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = context.watch<AuthProvider>().isLoading;

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 40.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 40),
              const Text(
                'EduSpace',
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF030213),
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Chào mừng bạn đến với không gian học tập mới.',
                style: TextStyle(fontSize: 16, color: Colors.grey),
              ),
              const SizedBox(height: 60),
              CustomTextField(
                controller: _emailController,
                label: 'Email',
                placeholder: 'example@gmail.com',
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 24),
              CustomTextField(
                controller: _passwordController,
                label: 'Mật khẩu',
                placeholder: 'Nhập mật khẩu của bạn',
                isPassword: true,
              ),
              const SizedBox(height: 40),
              PrimaryButton(
                text: 'ĐĂNG NHẬP',
                onPressed: _handleLogin,
                isLoading: isLoading,
              ),
              const SizedBox(height: 24),
              Center(
                child: TextButton(
                  onPressed: () {},
                  child: const Text(
                    'Bạn chưa có tài khoản? Đăng ký ngay',
                    style: TextStyle(color: Color(0xFF030213), fontWeight: FontWeight.w600),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }
}
