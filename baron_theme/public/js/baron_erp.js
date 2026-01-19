$(document).ready(() => {
	function addFullscreenToggleButton() {
		const maximize_icon_svg =
			'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-maximize"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>';
		const minimize_icon_svg =
			'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-minimize"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>';
		const fullscreenButton = document.createElement("li");
		fullscreenButton.id = "fullscreenToggleButton";
		fullscreenButton.innerHTML = maximize_icon_svg; // Use the SVG icon instead of text
		fullscreenButton.classList.add("nav-item", "toggle-fullscreen");

		fullscreenButton.style.color = "#fff";
		fullscreenButton.style.border = "none";
		fullscreenButton.style.cursor = "pointer";

		function tryAddingButton() {
			const navbarNav = document.querySelector(".dropdown-notifications");
			if (navbarNav) {
				if (!document.getElementById("fullscreenToggleButton")) {
					navbarNav.parentNode.insertBefore(fullscreenButton, navbarNav);
				}

				fullscreenButton.addEventListener("click", () => {
					if (!document.fullscreenElement) {
						document.documentElement
							.requestFullscreen()
							.then(() => {
								fullscreenButton.innerHTML = minimize_icon_svg;
							})
							.catch((err) => {
								console.error(
									`Error attempting to enable fullscreen mode: ${err.message}`
								);
							});
					} else {
						document
							.exitFullscreen()
							.then(() => {
								fullscreenButton.innerHTML = maximize_icon_svg;
							})
							.catch((err) => {
								console.error(
									`Error attempting to exit fullscreen mode: ${err.message}`
								);
							});
					}
				});
			} else {
				// Retry after a short delay if .navbar-nav is not available yet
				setTimeout(tryAddingButton, 500);
			}
		}

		tryAddingButton();
	}

	function getCurrentTheme() {
		return document.documentElement.getAttribute("data-theme") || "light";
	}
	
	function addInstallAppButton() {
		// Install icon SVG
		const install_icon_svg =
			'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>';

		const installAppButton = document.createElement("li");
		installAppButton.id = "installAppButton";
		installAppButton.innerHTML = install_icon_svg;
		installAppButton.classList.add("nav-item", "install-app");
		installAppButton.title = __("تثبيت التطبيق / إنشاء اختصار");

		installAppButton.style.color = "#fff";
		installAppButton.style.border = "none";
		installAppButton.style.cursor = "pointer";

		let deferredPrompt = null;
		let isInstalled = window.matchMedia('(display-mode: standalone)').matches;

		// Listen for the beforeinstallprompt event
		window.addEventListener('beforeinstallprompt', (e) => {
			// Prevent the mini-infobar from appearing on mobile
			e.preventDefault();
			// Stash the event so it can be triggered later
			deferredPrompt = e;
		});

		// Listen for app installed event
		window.addEventListener('appinstalled', () => {
			deferredPrompt = null;
			isInstalled = true;
			frappe.msgprint(__("تم تثبيت التطبيق بنجاح!"));
		});

		function tryAddingButton() {
			const fullscreenButton = document.querySelector("#fullscreenToggleButton");
			if (fullscreenButton) {
				if (!document.getElementById("installAppButton")) {
					fullscreenButton.parentNode.insertBefore(
						installAppButton,
						fullscreenButton.nextSibling
					);
				}

				installAppButton.addEventListener("click", async () => {
					// Check if app is already installed
					if (isInstalled || window.matchMedia('(display-mode: standalone)').matches) {
						frappe.msgprint(__("التطبيق مثبت بالفعل!"));
						return;
					}

					// Check if PWA install prompt is available (most direct method)
					if (deferredPrompt) {
						try {
							// Show the install prompt immediately
							deferredPrompt.prompt();
							
							// Wait for the user to respond to the prompt
							const { outcome } = await deferredPrompt.userChoice;
							
							if (outcome === 'accepted') {
								// Installation accepted - appinstalled event will fire
								return;
							}
							
							// Clear the deferredPrompt
							deferredPrompt = null;
						} catch (err) {
							console.error("Error showing install prompt:", err);
						}
					}

					// For iOS Safari - try to trigger share sheet
					if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
						if (navigator.share) {
							try {
								await navigator.share({
									title: document.title,
									text: __("أضف هذا التطبيق إلى الشاشة الرئيسية"),
									url: window.location.href
								});
								// After share, show instructions
								setTimeout(() => {
									frappe.msgprint({
										title: __("تثبيت التطبيق على iOS"),
										message: __("في شاشة المشاركة، اختر 'إضافة إلى الشاشة الرئيسية' (Add to Home Screen)")
									});
								}, 500);
								return;
							} catch (err) {
								if (err.name !== 'AbortError') {
									frappe.msgprint({
										title: __("تثبيت التطبيق على iOS"),
										message: __("اضغط على زر المشاركة (Share) في المتصفح ثم اختر 'إضافة إلى الشاشة الرئيسية' (Add to Home Screen)")
									});
								}
								return;
							}
						} else {
							frappe.msgprint({
								title: __("تثبيت التطبيق على iOS"),
								message: __("اضغط على زر المشاركة (Share) في المتصفح ثم اختر 'إضافة إلى الشاشة الرئيسية' (Add to Home Screen)")
							});
							return;
						}
					}

					// For Android Chrome - show instructions
					if (/Android/.test(navigator.userAgent)) {
						// Try Web Share API first
						if (navigator.share) {
							try {
								await navigator.share({
									title: document.title,
									text: __("ثبت هذا التطبيق"),
									url: window.location.href
								});
								return;
							} catch (err) {
								if (err.name !== 'AbortError') {
									// Fall through to show instructions
								}
							}
						}
						
						frappe.msgprint({
							title: __("تثبيت التطبيق على Android"),
							message: __("اضغط على قائمة المتصفح (⋮) في الزاوية العلوية اليمنى، ثم اختر 'تثبيت التطبيق' أو 'إضافة إلى الشاشة الرئيسية'")
						});
						return;
					}

					// For desktop browsers - try to create shortcut
					if (navigator.share) {
						try {
							await navigator.share({
								title: document.title,
								url: window.location.href
							});
							return;
						} catch (err) {
							if (err.name !== 'AbortError') {
								// Fall through to show instructions
							}
						}
					}

					// Fallback: Show instructions for manual installation
					const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
					const isEdge = /Edg/.test(navigator.userAgent);
					const isFirefox = /Firefox/.test(navigator.userAgent);
					
					let instructions = "";
					if (isChrome || isEdge) {
						instructions = __("انقر على أيقونة التثبيت في شريط العنوان، أو من قائمة المتصفح اختر 'تثبيت التطبيق'");
					} else if (isFirefox) {
						instructions = __("من قائمة المتصفح اختر 'إضافة إلى الشاشة الرئيسية'");
					} else {
						instructions = __("استخدم قائمة المتصفح لإضافة هذه الصفحة إلى الشاشة الرئيسية أو إنشاء اختصار");
					}

					frappe.msgprint({
						title: __("إنشاء اختصار"),
						message: instructions
					});
				});
			} else {
				// Retry after a short delay if #fullscreenToggleButton is not available yet
				setTimeout(tryAddingButton, 500);
			}
		}

		tryAddingButton();
	}

	function addLanguageSwitchButton() {
		const currentTheme = getCurrentTheme();

		const icon =
			'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-globe"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>';

		const languageSwitchButton = document.createElement("li");
		languageSwitchButton.id = "languageSwitchButton";
		languageSwitchButton.innerHTML = icon;
		languageSwitchButton.classList.add("nav-item", "toggle-language");

		languageSwitchButton.style.color = "#fff";
		languageSwitchButton.style.border = "none";
		languageSwitchButton.style.cursor = "pointer";

		function tryAddingButton() {
			const fullscreenButton = document.querySelector("#fullscreenToggleButton");
			if (fullscreenButton) {
				if (!document.getElementById("languageSwitchButton")) {
					fullscreenButton.parentNode.insertBefore(
						languageSwitchButton,
						fullscreenButton.nextSibling
					);
				}

				languageSwitchButton.addEventListener("click", () => {
					frappe.call({
						method: "frappe.client.get_list",
						args: {
							doctype: "Language",
							fields: ["language_name", "language_code"],
							limit_page_length: 0,
						},
						callback: function (response) {
							if (response.message) {
								const languages = response.message
									.map((lang) => `${lang.language_name} - ${lang.language_code}`)
									.join("\n");

								frappe.prompt(
									[
										{
											label: __("Select Language"),
											fieldname: "language",
											fieldtype: "Select",
											options: languages,
											reqd: 1,
										},
									],
									(values) => {
										const selectedLanguage = values.language.split(" - ")[1];

										console.log("Selected Language:", selectedLanguage);
										frappe.call({
											method: "frappe.client.set_value",
											args: {
												doctype: "User",
												name: frappe.session.user,
												fieldname: "language",
												value: selectedLanguage,
											},
											callback: function () {
												frappe.msgprint(
													__(
														"Language switched to " +
															values.language.split(" - ")[0] +
															". Reloading..."
													)
												);
												location.reload();
											},
											error: function () {
												frappe.msgprint(__("Failed to update language."));
											},
										});
									},
									__("Switch Language"),
									__("Submit")
								);
							} else {
								frappe.msgprint(__("No languages found."));
							}
						},
						error: function (error) {
							console.error("Error fetching languages:", error);
							frappe.msgprint(__("Failed to fetch languages."));
						},
					});
					// const currentTheme = getCurrentTheme();
					// console.log("Current theme:", currentTheme);
					// const theme_to_switch = currentTheme === "light" ? "Dark" : "Light";
					// frappe.call({
					// 	method: "frappe.core.doctype.user.user.switch_theme",
					// 	args: { theme: theme_to_switch },
					// 	callback: function (response) {
					// 		document.documentElement.setAttribute(
					// 			"data-theme",
					// 			theme_to_switch.toLowerCase()
					// 		);
					// 		themeToggleButton.innerHTML =
					// 			theme_to_switch === "Light" ? moon_icon_svg : sun_icon_svg;
					// 	},
					// 	error: function (error) {
					// 		console.error("Error switching theme:", error);
					// 		frappe.msgprint(__("Failed to switch theme."));
					// 	},
					// });
				});
			} else {
				// Retry after a short delay if #fullscreenToggleButton is not available yet
				setTimeout(tryAddingButton, 500);
			}
		}

		tryAddingButton();
	}

	addFullscreenToggleButton();
	// addInstallAppButton(); // Disabled - زر التحميل مخفي
	addLanguageSwitchButton();
});

(function () {
	// Helper to open new doc
	function openNewDoc(doctype) {
		try {
			if (window.frappe && typeof window.frappe.new_doc === "function") {
				window.frappe.new_doc(doctype);
				return;
			}
		} catch (err) {
			console.warn("frappe.new_doc failed:", err);
		}
		window.open("/app/" + encodeURIComponent(doctype) + "/new", "_blank");
	}

	function addButton(clearfix) {
		if (clearfix.dataset._btnAdded === "1") return;

		const wrapper = clearfix.closest('[data-fieldtype="Link"]');
		if (!wrapper) return;

		const input = wrapper.querySelector('input[data-fieldtype="Link"]');
		if (!input) return;

		const btn = document.createElement("span");
		// btn.type = "span";
		btn.textContent = "+";
		btn.className = "link-add-btn quick-create-btn";
		btn.style.padding = "1px 2px";
		// btn.style.marginLeft = "2px";
		// btn.style.border = "0.5px solid #ccc";
		// btn.style.borderRadius = "2px";
		// btn.style.background = "#f8f9fa";
		btn.style.cursor = "pointer";

		btn.addEventListener("click", () => {
			const target = input.dataset.target || input.dataset.doctype || "record";
			openNewDoc(target);
		});

		// Insert inside .clearfix
		clearfix.appendChild(btn);

		clearfix.dataset._btnAdded = "1";
	}

	function processAll() {
		document
			.querySelectorAll('div[data-fieldtype="Link"] > .form-group > .clearfix')
			.forEach(addButton);
	}

	// Initial run
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", processAll);
	} else {
		processAll();
	}

	// Watch for dynamic fields
	const mo = new MutationObserver(processAll);
	mo.observe(document.body, { childList: true, subtree: true });
})();
(function () {
  const titleStyle = `
    color: #00E5FF;
    font-size: 28px;
    font-weight: 700;
    text-shadow: 1px 1px 2px #000;
  `;

  const textStyle = `
    color: #B2EBF2;
    font-size: 13px;
  `;

  const warnStyle = `
    color: #FF5252;
    font-size: 14px;
    font-weight: bold;
  `;

  const linkStyle = `
    color: #80DEEA;
    font-size: 12px;
    text-decoration: underline;
  `;

  console.clear();

  console.log("%cBaron Technologies LLC", titleStyle);
  console.log(
    "%cERPNext Implementation • AI Automation • Custom Engineering Systems",
    textStyle
  );
  console.log(
    "%c⚠️  Unauthorized modification may break core business logic",
    warnStyle
  );
  console.log(
    "%chttps://barontech.com",
    linkStyle
  );
})();


// (function () {
//   function addButton(input) {
//     if (input.dataset._btnAdded === "1") return;

//     const btn = document.createElement("button");
//     btn.type = "button";
//     btn.textContent = "+";
//     btn.className = "link-add-btn btn-primary";
//     btn.style.padding = "4px 10px";
//     btn.style.border = "1px solid #ccc";
//     btn.style.borderRadius = "4px";
//     btn.style.background = "#f8f9fa";
//     btn.style.cursor = "pointer";

//     btn.addEventListener("click", () => {
//       const target = input.dataset.target || input.dataset.doctype || "record";
//       alert("Create new " + target);
//       // if frappe available:
//       // frappe.new_doc(target);
//     });

//     input.insertAdjacentElement("afterend", btn);
//     input.dataset._btnAdded = "1";
//   }

//   function processAll() {
//     document.querySelectorAll('input[data-fieldtype="Link"]').forEach(addButton);
//   }

//   // Initial run once DOM is ready
//   if (document.readyState === "loading") {
//     document.addEventListener("DOMContentLoaded", processAll);
//   } else {
//     processAll();
//   }

//   // Watch for dynamically inserted fields
//   const mo = new MutationObserver(() => processAll());
//   mo.observe(document.body, { childList: true, subtree: true });
// })();
