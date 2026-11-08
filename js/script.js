;(() => {
  "use strict"

  const SHOP_PHONE = "919974447442"
  const $ = (selector, scope = document) => scope.querySelector(selector)
  const $$ = (selector, scope = document) => [
    ...scope.querySelectorAll(selector),
  ]

  const menuToggle = $("#menuToggle")
  const navLinks = $("#navLinks")
  const searchToggle = $("#searchToggle")
  const searchPanel = $("#searchPanel")
  const siteSearch = $("#siteSearch")
  const productCards = $$(".product-card")
  const toast = $("#toast")
  const cart = []
  let activeFilter = "all"
  let toastTimer

  function showToast(message) {
    toast.textContent = message
    toast.classList.add("show")
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600)
  }

  function openWhatsApp(message) {
    const url = `https://wa.me/${SHOP_PHONE}?text=${encodeURIComponent(message)}`
    window.open(url, "_blank", "noopener,noreferrer")
  }

  function closeMobileMenu() {
    navLinks.classList.remove("open")
    menuToggle.setAttribute("aria-expanded", "false")
    menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>'
  }

  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open")
    menuToggle.setAttribute("aria-expanded", String(isOpen))
    menuToggle.innerHTML = isOpen
      ? '<i class="fa-solid fa-xmark"></i>'
      : '<i class="fa-solid fa-bars"></i>'
  })

  $$("#navLinks a").forEach((link) =>
    link.addEventListener("click", closeMobileMenu),
  )

  searchToggle.addEventListener("click", () => {
    searchPanel.classList.toggle("open")
    if (searchPanel.classList.contains("open")) siteSearch.focus()
  })
  $("#clearSearch").addEventListener("click", () => {
    siteSearch.value = ""
    filterProducts()
    siteSearch.focus()
  })

  function filterProducts() {
    const term = siteSearch.value.trim().toLowerCase()
    let visible = 0
    productCards.forEach((card) => {
      const matchesBrand =
        activeFilter === "all" || card.dataset.brand === activeFilter
      const matchesTerm = `${card.dataset.name} ${card.dataset.brand}`
        .toLowerCase()
        .includes(term)
      const show = matchesBrand && matchesTerm
      card.hidden = !show
      if (show) visible++
    })
    $("#emptyState").style.display = visible ? "none" : "block"
  }
  siteSearch.addEventListener("input", filterProducts)
  $$("#phoneFilters .filter").forEach((button) => {
    button.addEventListener("click", () => {
      $$("#phoneFilters .filter").forEach((item) =>
        item.classList.remove("active"),
      )
      button.classList.add("active")
      activeFilter = button.dataset.filter
      filterProducts()
    })
  })

  function renderCart() {
    $("#cartCount").textContent = cart.length
    const list = $("#cartItems")
    list.innerHTML = ""
    if (!cart.length) {
      list.innerHTML = '<li class="cart-empty">Your shortlist is empty.</li>'
    } else {
      cart.forEach((name, index) => {
        const li = document.createElement("li")
        const span = document.createElement("span")
        span.textContent = name
        const remove = document.createElement("button")
        remove.className = "remove-item"
        remove.type = "button"
        remove.textContent = "Remove"
        remove.setAttribute("aria-label", `Remove ${name}`)
        remove.addEventListener("click", () => {
          cart.splice(index, 1)
          renderCart()
        })
        li.append(span, remove)
        list.appendChild(li)
      })
    }
    $("#sendCart").disabled = cart.length === 0
  }

  $$(".add-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const product = button.dataset.product
      if (!cart.includes(product)) {
        cart.push(product)
        renderCart()
        showToast(`${product} added to your enquiry list.`)
      } else {
        showToast(`${product} is already in your list.`)
      }
    })
  })

  const cartDrawer = $("#cartDrawer")
  const cartBackdrop = $("#cartBackdrop")
  function setCartOpen(open) {
    cartDrawer.classList.toggle("open", open)
    cartBackdrop.classList.toggle("open", open)
    document.body.style.overflow = open ? "hidden" : ""
  }
  $("#cartButton").addEventListener("click", () => setCartOpen(true))
  $("#cartClose").addEventListener("click", () => setCartOpen(false))
  cartBackdrop.addEventListener("click", () => setCartOpen(false))
  $("#sendCart").addEventListener("click", () => {
    if (!cart.length) return
    openWhatsApp(
      `Hello Sonu Mobile Shop, I would like to enquire about these products:\n${cart.map((item, i) => `${i + 1}. ${item}`).join("\n")}\nPlease share current availability and prices.`,
    )
  })

  const modal = $("#productModal")
  function closeModal() {
    modal.classList.remove("open")
    modal.setAttribute("aria-hidden", "true")
    document.body.style.overflow = ""
  }
  $$(".quick-view").forEach((button) => {
    button.addEventListener("click", () => {
      const [name, brand, variant, description] =
        button.dataset.details.split("|")
      $("#modalTitle").textContent = name
      $("#modalBrand").textContent = brand.toUpperCase()
      $("#modalDescription").textContent = `${variant}. ${description}`
      $("#modalWhatsApp").onclick = (event) => {
        event.preventDefault()
        openWhatsApp(
          `Hello, I would like to enquire about ${name}. Please share current availability and pricing.`,
        )
      }
      modal.classList.add("open")
      modal.setAttribute("aria-hidden", "false")
      document.body.style.overflow = "hidden"
      $("#modalClose").focus()
    })
  })
  $("#modalClose").addEventListener("click", closeModal)
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal()
  })

  $$("[data-message]").forEach((element) => {
    element.addEventListener("click", (event) => {
      event.preventDefault()
      openWhatsApp(element.dataset.message)
    })
  })

  $$("[data-accessory]").forEach((element) => {
    element.addEventListener("click", () => {
      const category = element.dataset.accessory
      $("#customerMessage").value =
        `I would like to enquire about ${category}. Please share available options and prices.`
    })
  })

  $("#contactForm").addEventListener("submit", (event) => {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.reportValidity()) return
    const name = $("#customerName").value.trim()
    const phone = $("#customerPhone").value.trim()
    const message = $("#customerMessage").value.trim()
    const whatsappMessage = `Hello Sonu Mobile Shop,\nMy name is ${name}.\nMy contact number is ${phone}.\nEnquiry: ${message}`
    $("#formStatus").textContent =
      "Opening WhatsApp with your enquiry. Please review and send the message there."
    openWhatsApp(whatsappMessage)
  })

  const backTop = $("#backTop")
  window.addEventListener(
    "scroll",
    () => {
      backTop.classList.toggle("visible", window.scrollY > 500)
    },
    { passive: true },
  )
  backTop.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" }),
  )
  $("#year").textContent = new Date().getFullYear()

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view")
          revealObserver.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.12 },
  )
  $$(
    ".hero-copy, .hero-visual, .product-card, .accessory-card, .benefit, .about-image, .about-copy",
  ).forEach((element) => {
    element.classList.add("reveal")
    revealObserver.observe(element)
  })

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal()
      setCartOpen(false)
      closeMobileMenu()
    }
  })

  renderCart()
})()
