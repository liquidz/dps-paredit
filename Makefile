format_check:
	deno fmt --check --unstable --ignore=cov_profile

test:
	deno test --unstable --coverage=cov_profile
