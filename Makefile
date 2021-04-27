format_check:
	deno fmt --check

test:
	deno test --unstable --coverage=cov_profile
