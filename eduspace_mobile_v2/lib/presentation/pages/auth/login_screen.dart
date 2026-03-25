import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../common/widgets/edu_logo.dart';
import '../../common/widgets/edu_text_field.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_strings.dart';
import '../../../core/utils/snackbar_utils.dart';
import '../../providers/auth/auth_provider.dart';
import '../../providers/message/message_provider.dart';
import '../../../routes/app_router.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  bool _obscurePass = true;
  bool _keepSignedIn = false;

  final _formKey = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passCtrl.dispose();
    super.dispose();
  }

  Future<void> _onSignIn() async {
    final email = _emailCtrl.text.trim();
    final password = _passCtrl.text.trim();

    if (email.isEmpty || password.isEmpty) {
      SnackBarUtils.show(
        context,
        'Vui lòng nhập đầy đủ email và mật khẩu!',
        isError: true,
      );
      return;
    }

    final authProvider = context.read<AuthProvider>();
    final success = await authProvider.login(email, password);

    if (!mounted) return;

    if (success) {
      final token = authProvider.token;
      if (token != null) {
        // Authenticate MessageProvider so WebSocket reconnects with token
        if (mounted) {
          context.read<MessageProvider>().authenticate(token);
        }
      }
      
      SnackBarUtils.show(context, 'Đăng nhập thành công!');
      Navigator.pushReplacementNamed(context, AppRouter.home);
    } else {
      SnackBarUtils.show(
        context,
        authProvider.error ?? 'Đăng nhập thất bại!',
        isError: true,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = context.watch<AuthProvider>().isLoading;

    return Scaffold(
      backgroundColor: AppColors.surface,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            children: [
              // ─── Header: Logo ───────────────────────
              const SizedBox(height: 48),
              const EduSpaceLogo(),
              const SizedBox(height: 32),

              // ─── Main Content ────────────────────────
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  children: [
                    // Social buttons
                    _SocialButtons(),
                    const SizedBox(height: 24),

                    // Divider
                    _OrDivider(),
                    const SizedBox(height: 24),

                    // Sign In Form
                    _SignInForm(
                      formKey: _formKey,
                      emailCtrl: _emailCtrl,
                      passCtrl: _passCtrl,
                      obscurePass: _obscurePass,
                      keepSignedIn: _keepSignedIn,
                      isLoading: isLoading,
                      onTogglePass: () =>
                          setState(() => _obscurePass = !_obscurePass),
                      onKeepSignedIn: (v) => setState(() => _keepSignedIn = v!),
                      onSubmit: _onSignIn,
                    ),
                    const SizedBox(height: 16),

                    // Navigate to Register
                    _SwitchTabText(
                      text: AppStrings.noAccount,
                      linkText: AppStrings.createAccount,
                      onTap: () => Navigator.pushNamed(context, '/register'),
                    ),
                    const SizedBox(height: 40),
                  ],
                ),
              ),

              // ─── Footer ──────────────────────────────
              const _AuthFooter(),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}

// ─────────────────────── Social Buttons ─────────────────────
class _SocialButtons extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _SocialButton(
            label: 'Google',
            icon: _googleIcon(),
            onTap: () {},
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _SocialButton(
            label: 'Facebook',
            icon: const Icon(
              Icons.facebook,
              color: Color(0xFF1877F2), // Use literal if AppColors.facebook is tricky
              size: 22,
            ),
            onTap: () {},
          ),
        ),
      ],
    );
  }

  Widget _googleIcon() {
    // Dùng ảnh nền white Google icon cho brand-match
    return const Icon(Icons.g_mobiledata, size: 28, color: Colors.blueAccent);
  }
}

class _SocialButton extends StatelessWidget {
  final String label;
  final Widget icon;
  final VoidCallback onTap;

  const _SocialButton({
    required this.label,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return OutlinedButton(
      onPressed: onTap,
      style: OutlinedButton.styleFrom(
        padding: const EdgeInsets.symmetric(vertical: 14),
        side: const BorderSide(color: AppColors.border),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        backgroundColor: AppColors.surface,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          icon,
          const SizedBox(width: 8),
          Text(
            label,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: AppColors.navy900,
            ),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────── Divider ────────────────────────────
class _OrDivider extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Expanded(child: Divider(color: AppColors.border, thickness: 1)),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Text(
            AppStrings.orContinueWithEmail.toUpperCase(),
            style: const TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w800,
              letterSpacing: 1.5,
              color: AppColors.textHint,
            ),
          ),
        ),
        const Expanded(child: Divider(color: AppColors.border, thickness: 1)),
      ],
    );
  }
}

// ─────────────────────── Sign In Form ───────────────────────
class _SignInForm extends StatelessWidget {
  final GlobalKey<FormState> formKey;
  final TextEditingController emailCtrl;
  final TextEditingController passCtrl;
  final bool obscurePass;
  final bool keepSignedIn;
  final bool isLoading;
  final VoidCallback onTogglePass;
  final ValueChanged<bool?> onKeepSignedIn;
  final VoidCallback onSubmit;

  const _SignInForm({
    required this.formKey,
    required this.emailCtrl,
    required this.passCtrl,
    required this.obscurePass,
    required this.keepSignedIn,
    required this.isLoading,
    required this.onTogglePass,
    required this.onKeepSignedIn,
    required this.onSubmit,
  });

  @override
  Widget build(BuildContext context) {
    return Form(
      key: formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          EduTextField(
            label: AppStrings.emailAddress,
            placeholder: 'name@company.com',
            prefixIcon: Icons.mail_outline_rounded,
            keyboardType: TextInputType.emailAddress,
            controller: emailCtrl,
          ),
          const SizedBox(height: 16),
          _PasswordField(
            label: AppStrings.password,
            placeholder: '••••••••',
            controller: passCtrl,
            obscure: obscurePass,
            onToggle: onTogglePass,
            showForgot: true,
          ),
          const SizedBox(height: 12),

          // Keep me signed in
          Row(
            children: [
              SizedBox(
                width: 20,
                height: 20,
                child: Checkbox(
                  value: keepSignedIn,
                  onChanged: onKeepSignedIn,
                  activeColor: AppColors.primary,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              const Text(
                AppStrings.keepMeSignedIn,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Submit button
          _PrimaryButton(
            label: AppStrings.signInToEduSpace,
            onTap: onSubmit,
            isLoading: isLoading,
          ),
        ],
      ),
    );
  }
}

// ─────────────────────── Shared Widgets ─────────────────────
class _PasswordField extends StatelessWidget {
  final String label;
  final String placeholder;
  final TextEditingController controller;
  final bool obscure;
  final VoidCallback onToggle;
  final bool showForgot;

  const _PasswordField({
    required this.label,
    required this.placeholder,
    required this.controller,
    required this.obscure,
    required this.onToggle,
    this.showForgot = false,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label.toUpperCase(),
              style: const TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w800,
                letterSpacing: 1.2,
                color: AppColors.textSecondary,
              ),
            ),
            if (showForgot)
              GestureDetector(
                onTap: () {},
                child: const Text(
                  AppStrings.forgotPassword,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primary,
                  ),
                ),
              ),
          ],
        ),
        const SizedBox(height: 6),
        TextField(
          controller: controller,
          obscureText: obscure,
          style: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w500,
            color: AppColors.textPrimary,
          ),
          decoration: InputDecoration(
            hintText: placeholder,
            hintStyle: const TextStyle(color: AppColors.textHint),
            filled: true,
            fillColor: AppColors.inputBg,
            prefixIcon: const Icon(
              Icons.lock_outline_rounded,
              size: 20,
              color: AppColors.textHint,
            ),
            suffixIcon: IconButton(
              icon: Icon(
                obscure
                    ? Icons.visibility_outlined
                    : Icons.visibility_off_outlined,
                size: 20,
                color: AppColors.textHint,
              ),
              onPressed: onToggle,
            ),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 16,
            ),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.border),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.border),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(
                color: AppColors.primary,
                width: 1.5,
              ),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.error),
            ),
            focusedErrorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: AppColors.error, width: 1.5),
            ),
          ),
        ),
      ],
    );
  }
}

class _PrimaryButton extends StatelessWidget {
  final String label;
  final VoidCallback onTap;
  final bool isLoading;

  const _PrimaryButton({
    required this.label,
    required this.onTap,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 54,
      child: ElevatedButton(
        onPressed: isLoading ? null : onTap,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          elevation: 4,
          shadowColor: AppColors.primary.withValues(alpha: 0.3),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        child: isLoading
            ? const SizedBox(
                height: 24,
                width: 24,
                child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    label,
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(width: 8),
                  const Icon(Icons.login_rounded, size: 20),
                ],
              ),
      ),
    );
  }
}

class _SwitchTabText extends StatelessWidget {
  final String text;
  final String linkText;
  final VoidCallback onTap;

  const _SwitchTabText({
    required this.text,
    required this.linkText,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          '$text ',
          style: const TextStyle(fontSize: 14, color: AppColors.textSecondary),
        ),
        GestureDetector(
          onTap: onTap,
          child: Text(
            linkText,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: AppColors.primary,
            ),
          ),
        ),
      ],
    );
  }
}

class _AuthFooter extends StatelessWidget {
  const _AuthFooter();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 24),
      decoration: const BoxDecoration(
        border: Border(top: BorderSide(color: AppColors.border)),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const _FooterBadge(icon: Icons.verified_user_outlined, label: 'SECURE'),
              const SizedBox(width: 24),
              const _FooterBadge(icon: Icons.security_outlined, label: 'SSL'),
            ],
          ),
          const SizedBox(height: 12),
          Text.rich(
            TextSpan(
              text: '${AppStrings.secureSSL}\n',
              style: const TextStyle(
                fontSize: 11,
                color: AppColors.textHint,
                height: 1.6,
              ),
              children: [
                WidgetSpan(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      GestureDetector(
                        onTap: () {},
                        child: const Text(
                          AppStrings.termsOfService,
                          style: TextStyle(
                            fontSize: 11,
                            decoration: TextDecoration.underline,
                            color: AppColors.textHint,
                          ),
                        ),
                      ),
                      const Text(
                        ' and ',
                        style: TextStyle(
                          fontSize: 11,
                          color: AppColors.textHint,
                        ),
                      ),
                      GestureDetector(
                        onTap: () {},
                        child: const Text(
                          AppStrings.privacyPolicy,
                          style: TextStyle(
                            fontSize: 11,
                            decoration: TextDecoration.underline,
                            color: AppColors.textHint,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

class _FooterBadge extends StatelessWidget {
  final IconData icon;
  final String label;

  const _FooterBadge({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 14, color: AppColors.textHint),
        const SizedBox(width: 4),
        Text(
          label,
          style: const TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w800,
            letterSpacing: 1.5,
            color: AppColors.textHint,
          ),
        ),
      ],
    );
  }
}
